"""enable pgvector extension

Revision ID: 5cdeba54ebd0
Revises: 8850930588fb
Create Date: 2026-04-22 20:05:18.608001

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '5cdeba54ebd0'
down_revision: Union[str, Sequence[str], None] = '8850930588fb'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")

def downgrade():
    op.execute("DROP EXTENSION IF EXISTS vector")