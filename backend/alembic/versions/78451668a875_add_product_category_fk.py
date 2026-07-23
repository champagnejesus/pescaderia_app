"""add_product_category_fk

Revision ID: 78451668a875
Revises: 7abc5c52c88f
Create Date: 2026-07-22 20:57:25.635308

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '78451668a875'
down_revision: Union[str, None] = '7abc5c52c88f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    dialect = conn.dialect.name

    op.add_column("products", sa.Column("category_id", sa.Integer(), nullable=True))

    if dialect == "sqlite":
        conn.exec_driver_sql("PRAGMA foreign_keys = OFF")

    # Create missing categories from distinct product.category strings
    conn.execute(sa.text("""
        INSERT OR IGNORE INTO categories (name, business_id)
        SELECT DISTINCT products.category, 1 FROM products WHERE products.category IS NOT NULL AND products.category != ''
    """))

    # Populate category_id from matching category name
    conn.execute(sa.text("""
        UPDATE products SET category_id = (
            SELECT categories.id FROM categories
            WHERE categories.name = products.category AND categories.business_id = 1
        )
    """))

    if dialect == "sqlite":
        op.execute("PRAGMA foreign_keys = ON")


def downgrade() -> None:
    op.drop_column("products", "category_id")
