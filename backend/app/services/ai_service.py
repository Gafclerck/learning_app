from sentence_transformers import SentenceTransformer
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.models.course import Course
from app.models.embedding import CourseEmbedding
from app.models.enrollment import Enrollment
from app.models.user import User

# Charge le modèle une seule fois au démarrage
# Le modèle est téléchargé automatiquement la première fois
model = SentenceTransformer("all-MiniLM-L6-v2")


def generate_embedding(text: str) -> list[float]:
    """
    Transforme un texte en vecteur numérique.
    C'est le coeur du système - deux textes similaires
    produisent des vecteurs proches.
    """
    embedding = model.encode(text)
    return embedding.tolist()


def get_course_text(course: Course) -> str:
    """
    Construit le texte représentatif d'un cours.
    On concatène titre et description pour avoir
    le maximum de contexte sémantique.
    """
    parts = [course.title]
    if course.description:
        parts.append(course.description)
    return " ".join(parts)


def index_course(db: Session, course_id: int) -> CourseEmbedding:
    """
    Génère et stocke l'embedding d'un cours.
    Appelé quand un cours est créé ou modifié.
    """
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        return None

    # Générer l'embedding
    text        = get_course_text(course)
    embedding   = generate_embedding(text)

    # Vérifier si un embedding existe déjà pour ce cours
    existing = db.query(CourseEmbedding).filter(
        CourseEmbedding.course_id == course_id
    ).first()

    if existing:
        # Mettre à jour l'embedding existant
        existing.embedding = embedding
        db.commit()
        return existing

    # Créer un nouvel embedding
    course_embedding = CourseEmbedding(
        course_id = course_id,
        embedding = embedding
    )
    db.add(course_embedding)
    db.commit()
    db.refresh(course_embedding)
    return course_embedding


def get_recommendations(
    db      : Session,
    user    : User,
    limit   : int = 5
) -> list[dict]:
    """
    Recommande des cours basés sur le profil de l'utilisateur.
    Le profil est construit à partir des cours déjà suivis.
    """
    import numpy as np

    # Récupérer les cours que l'utilisateur suit déjà
    enrolled_course_ids = [
        e.course_id for e in
        db.query(Enrollment).filter(Enrollment.user_id == user.id).all()
    ]

    # Si l'utilisateur n'a pas encore de cours - retourner les plus populaires
    if not enrolled_course_ids:
        return get_popular_courses(db, limit)

    # Récupérer les embeddings des cours suivis
    enrolled_embeddings = db.query(CourseEmbedding).filter(
        CourseEmbedding.course_id.in_(enrolled_course_ids)
    ).all()

    if not enrolled_embeddings:
        return get_popular_courses(db, limit)

    # Construire le vecteur profil - moyenne des embeddings des cours suivis
    # Plus l'utilisateur suit un type de cours, plus son profil
    # ressemble à ce type
    vectors      = [e.embedding for e in enrolled_embeddings]
    profile      = np.mean(vectors, axis=0).tolist()
    profile_str  = "[" + ",".join(map(str, profile)) + "]"

    # Requête pgvector - trouver les cours les plus similaires au profil
    # <=> est l'opérateur de distance cosine de pgvector
    # On exclut les cours déjà suivis
    query = text("""
        SELECT
            c.id,
            c.title,
            c.description,
            c.level,
            c.price,
            c.is_free,
            1 - (ce.embedding <=> :profile::vector) AS similarity_score
        FROM courses c
        JOIN course_embeddings ce ON ce.course_id = c.id
        WHERE
            c.is_published = true
            AND c.id NOT IN :enrolled_ids
        ORDER BY ce.embedding <=> :profile::vector
        LIMIT :limit
    """)

    results = db.execute(query, {
        "profile"      : profile_str,
        "enrolled_ids" : tuple(enrolled_course_ids) if enrolled_course_ids else (0,),
        "limit"        : limit
    }).fetchall()

    return [
        {
            "course_id"       : row.id,
            "title"           : row.title,
            "description"     : row.description,
            "level"           : row.level,
            "price"           : float(row.price),
            "is_free"         : row.is_free,
            "similarity_score": round(float(row.similarity_score), 3)
        }
        for row in results
    ]


def get_popular_courses(db: Session, limit: int = 5) -> list[dict]:
    """
    Fallback - retourne les cours les plus populaires
    quand l'utilisateur n'a pas encore d'historique.
    Populaire = le plus d'enrollments.
    """
    from sqlalchemy import func
    from app.models.enrollment import Enrollment

    results = (
        db.query(
            Course,
            func.count(Enrollment.id).label("enrollment_count")
        )
        .outerjoin(Enrollment, Enrollment.course_id == Course.id)
        .filter(Course.is_published == True)
        .group_by(Course.id)
        .order_by(func.count(Enrollment.id).desc())
        .limit(limit)
        .all()
    )

    return [
        {
            "course_id"       : course.id,
            "title"           : course.title,
            "description"     : course.description,
            "level"           : course.level,
            "price"           : float(course.price),
            "is_free"         : course.is_free,
            "similarity_score": None
        }
        for course, count in results
    ]