-- CreateTable
CREATE TABLE "organizations" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "sector" JSONB,
    "locations" JSONB,
    "customer_locations" JSONB,
    "data_types" JSONB,
    "infrastructure" JSONB,
    "customer_type" TEXT,
    "org_size" TEXT,
    "revenue" TEXT,
    "reset_token" TEXT,
    "reset_token_expires" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recommendations" (
    "id" SERIAL NOT NULL,
    "org_id" INTEGER NOT NULL,
    "required_frameworks" JSONB NOT NULL,
    "recommended_frameworks" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "organizations_email_key" ON "organizations"("email");

-- CreateIndex
CREATE INDEX "idx_recommendations_org_id" ON "recommendations"("org_id");

-- AddForeignKey
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
