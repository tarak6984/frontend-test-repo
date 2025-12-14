-- CreateIndex
CREATE INDEX "AuditLog_documentId_idx" ON "AuditLog"("documentId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_timestamp_idx" ON "AuditLog"("timestamp");

-- CreateIndex
CREATE INDEX "Document_fundId_idx" ON "Document"("fundId");

-- CreateIndex
CREATE INDEX "Document_type_idx" ON "Document"("type");

-- CreateIndex
CREATE INDEX "Document_status_idx" ON "Document"("status");

-- CreateIndex
CREATE INDEX "Document_uploadedById_idx" ON "Document"("uploadedById");

-- CreateIndex
CREATE INDEX "Document_createdAt_idx" ON "Document"("createdAt");

-- CreateIndex
CREATE INDEX "Document_periodEnd_idx" ON "Document"("periodEnd");

-- CreateIndex
CREATE INDEX "Document_fundId_status_idx" ON "Document"("fundId", "status");

-- CreateIndex
CREATE INDEX "Document_fundId_type_idx" ON "Document"("fundId", "type");

-- CreateIndex
CREATE INDEX "Fund_code_idx" ON "Fund"("code");

-- CreateIndex
CREATE INDEX "Fund_name_idx" ON "Fund"("name");

-- CreateIndex
CREATE INDEX "Fund_region_idx" ON "Fund"("region");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");
