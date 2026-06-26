-- CreateTable
CREATE TABLE "MockAttempt" (
    "id" TEXT NOT NULL,
    "clientId" TEXT,
    "status" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "submittedAt" TIMESTAMP(3),
    "durationSeconds" INTEGER,
    "remainingSeconds" INTEGER NOT NULL,
    "rawScore" INTEGER,
    "rawTotal" INTEGER,
    "weightedScore" DOUBLE PRECISION,
    "weightedTotal" DOUBLE PRECISION,
    "readinessScore" INTEGER,
    "sectionScores" JSONB,
    "overallScore" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MockAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MockQuestionResponse" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "selectedAnswer" TEXT,
    "correctAnswer" TEXT NOT NULL,
    "isAnswered" BOOLEAN NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "isFlagged" BOOLEAN NOT NULL,
    "timeSpentSeconds" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MockQuestionResponse_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MockAttempt_clientId_idx" ON "MockAttempt"("clientId");

-- CreateIndex
CREATE INDEX "MockAttempt_submittedAt_idx" ON "MockAttempt"("submittedAt");

-- CreateIndex
CREATE INDEX "MockAttempt_status_idx" ON "MockAttempt"("status");

-- CreateIndex
CREATE INDEX "MockQuestionResponse_questionId_idx" ON "MockQuestionResponse"("questionId");

-- CreateIndex
CREATE INDEX "MockQuestionResponse_section_idx" ON "MockQuestionResponse"("section");

-- CreateIndex
CREATE INDEX "MockQuestionResponse_topic_idx" ON "MockQuestionResponse"("topic");

-- CreateIndex
CREATE INDEX "MockQuestionResponse_difficulty_idx" ON "MockQuestionResponse"("difficulty");

-- CreateIndex
CREATE INDEX "MockQuestionResponse_isCorrect_idx" ON "MockQuestionResponse"("isCorrect");

-- CreateIndex
CREATE UNIQUE INDEX "MockQuestionResponse_attemptId_questionId_key" ON "MockQuestionResponse"("attemptId", "questionId");

-- AddForeignKey
ALTER TABLE "MockQuestionResponse" ADD CONSTRAINT "MockQuestionResponse_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "MockAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;
