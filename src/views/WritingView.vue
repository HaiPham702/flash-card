<!-- WritingView.vue -->
<template>
    <div class="writing-view">
        <h1 class="page-title">IELTS Writing Practice</h1>

        <!-- Writing Task List -->
        <div v-if="!selectedSubmission && !isWriting" class="submissions-list">
            <div class="section-header">
                <h2>Your Writing Submissions</h2>
                <button @click="startNewWriting" class="primary-button">
                    <i class="fas fa-plus"></i>
                    New Writing Task
                </button>
            </div>

            <div class="submissions-grid">
                <div v-for="submission in submissions" :key="submission._id" class="submission-card">
                    <div class="submission-content">
                        <div class="submission-header">
                            <h3>{{ submission.question.substring(0, 100) }}...</h3>
                            <div class="submission-meta">
                                <span class="word-count">
                                    <i class="fas fa-pencil-alt"></i>
                                    {{ submission.wordCount }} words
                                </span>
                                <span class="band-score">
                                    <i class="fas fa-star"></i>
                                    Band {{ submission.aiScore.overallBand }}
                                </span>
                            </div>
                            <p class="submission-date">
                                <i class="fas fa-calendar"></i>
                                {{ new Date(submission.submittedAt).toLocaleDateString() }}
                            </p>
                        </div>
                        <button @click="viewSubmission(submission)" class="view-button">
                            View Details
                            <i class="fas fa-arrow-right"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Writing Task Form -->
        <div v-if="isWriting" class="writing-form">
            <div class="task-container">
                <h2 class="task-title">Writing Task 2</h2>

                <!-- Question Input Section -->
                <div class="question-input-section" v-if="!hasStartedWriting">
                    <h3 class="section-subtitle">Choose Your Question</h3>

                    <div class="question-options">
                        <!-- Sample Questions -->
                        <div class="sample-questions">
                            <h4>Sample Questions</h4>
                            <div class="questions-grid">
                                <div v-for="(question, index) in sampleQuestions" :key="index" class="question-card"
                                    :class="{ 'selected': currentQuestion === question }"
                                    @click="selectQuestion(question)">
                                    <p>{{ question }}</p>
                                    <button class="select-button">
                                        <i class="fas"
                                            :class="currentQuestion === question ? 'fa-check-circle' : 'fa-circle'"></i>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Custom Question Input -->
                        <div class="custom-question">
                            <h4>Or Write Your Own Question</h4>
                            <textarea v-model="customQuestion" class="question-input"
                                placeholder="Enter your IELTS Writing Task 2 question here..."
                                @input="onCustomQuestionInput"></textarea>
                        </div>

                        <div class="start-actions">
                            <button @click="cancelWriting" class="cancel-button">
                                <i class="fas fa-times"></i>
                                Cancel
                            </button>
                            <button @click="startWriting" class="submit-button" :disabled="!currentQuestion">
                                <i class="fas fa-play"></i>
                                Start Writing
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Writing Section -->
                <div v-else>
                    <div class="question-box">
                        <p>{{ currentQuestion }}</p>
                    </div>
                    <div class="writing-stats">
                        <div class="stat-item">
                            <i class="fas fa-calculator"></i>
                            <span>Word Count: <strong>{{ wordCount }}</strong></span>
                        </div>
                        <div class="stat-item timer" :class="{ 'warning': timeRemaining < 600 }">
                            <i class="fas fa-clock"></i>
                            <span>Time Remaining: <strong>{{ formatTime(timeRemaining) }}</strong></span>
                        </div>
                    </div>
                    <textarea v-model="essay" class="essay-input" placeholder="Write your essay here..."
                        @input="updateWordCount"></textarea>
                    <div class="action-buttons">
                        <button @click="cancelWriting" class="cancel-button">
                            <i class="fas fa-times"></i>
                            Cancel
                        </button>
                        <button @click="submitEssay" class="submit-button" :disabled="!isValidSubmission"
                            :class="{ 'disabled': !isValidSubmission }">
                            <i class="fas fa-paper-plane"></i>
                            Submit Essay
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Submission Details -->
        <div v-if="selectedSubmission" class="submission-details">
            <div class="details-header">
                <h2>Submission Details</h2>
                <button @click="selectedSubmission = null" class="back-button">
                    <i class="fas fa-arrow-left"></i>
                    Back to List
                </button>
            </div>

            <div class="details-container">
                <div class="detail-section">
                    <h3>Question</h3>
                    <div class="content-box">
                        <p>{{ selectedSubmission.question }}</p>
                    </div>
                </div>

                <div class="detail-section">
                    <h3>Your Essay</h3>
                    <div class="content-box essay">
                        <p>{{ selectedSubmission.essay }}</p>
                        <div class="word-count-badge">
                            <i class="fas fa-pencil-alt"></i>
                            {{ selectedSubmission.wordCount }} words
                        </div>
                    </div>
                </div>

                <div class="detail-section">
                    <h3>AI Assessment</h3>
                    <div class="assessment-grid">
                        <div v-for="criterion in criteriaList" :key="criterion" class="criterion-card">
                            <h4>
                                {{ formatCriterion(criterion) }}
                                <span class="band-badge">Band {{ getCriterionScore(selectedSubmission?.aiScore,
                                    criterion) }}</span>
                            </h4>
                            <p>{{ getCriterionFeedback(selectedSubmission?.aiScore, criterion) }}</p>
                        </div>
                    </div>
                </div>

                <div class="overall-score">
                    <h3>
                        Overall Band Score
                        <span class="score-badge">{{ selectedSubmission.aiScore.overallBand }}</span>
                    </h3>
                    <div class="feedback-box">
                        {{ selectedSubmission.detailedFeedback }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { writingApi } from '@/api/writing';
import type { WritingSubmission } from '@/api/writing';
import { useNotificationStore } from '@/stores/notification';

const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const submissions = ref < WritingSubmission[] > ([]);
const selectedSubmission = ref < WritingSubmission | null > (null);
const isWriting = ref(false);
const essay = ref('');
const wordCount = ref(0);
const timeRemaining = ref(40 * 60); // 40 minutes in seconds
let timer: number | null = null;

const criteriaList = [
    'taskAchievement',
    'coherenceAndCohesion',
    'lexicalResource',
    'grammaticalRangeAndAccuracy'
] as const;

type CriterionKey = typeof criteriaList[number];

const getCriterionScore = (
    aiScore: WritingSubmission['aiScore'] | undefined,
    criterion: CriterionKey
) => {
    if (!aiScore) return 0;
    return aiScore[criterion].band;
};

const getCriterionFeedback = (
    aiScore: WritingSubmission['aiScore'] | undefined,
    criterion: CriterionKey
) => {
    if (!aiScore) return '';
    return aiScore[criterion].feedback;
};

const hasStartedWriting = ref(false);
const customQuestion = ref('');
const sampleQuestions = [
    'Some people believe that unpaid community service should be a compulsory part of high school programmes. To what extent do you agree or disagree with this statement?',
    'In many countries, the gap between the rich and the poor is increasing. What problems does this cause? What measures could be taken to address these problems?',
    'Some people think that governments should spend less money on arts and invest more in public services. To what extent do you agree or disagree?'
];

const currentQuestion = ref('');

const selectQuestion = (question: string) => {
    currentQuestion.value = question;
    customQuestion.value = '';
};

const onCustomQuestionInput = () => {
    currentQuestion.value = customQuestion.value;
};

const startWriting = () => {
    if (currentQuestion.value) {
        hasStartedWriting.value = true;
        startTimer();
    }
};

// Computed property for submission validation
const isValidSubmission = computed(() => {
    return wordCount.value >= 250 && essay.value.trim().length > 0;
});

// Format criterion name for display
const formatCriterion = (criterion: string) => {
    return criterion
        .split(/(?=[A-Z])/)
        .join(' ')
        .replace(/^\w/, (c) => c.toUpperCase());
};

// Format time remaining
const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// Start timer for writing task
const startTimer = () => {
    timer = window.setInterval(() => {
        if (timeRemaining.value > 0) {
            timeRemaining.value--;
        } else {
            if (timer) clearInterval(timer);
            // Auto-submit when time is up
            if (isWriting.value) {
                submitEssay();
            }
        }
    }, 1000);
};

// Update word count
const updateWordCount = () => {
    wordCount.value = essay.value.trim().split(/\s+/).length;
};

// Start new writing task
const startNewWriting = () => {
    isWriting.value = true;
    hasStartedWriting.value = false;
    essay.value = '';
    wordCount.value = 0;
    timeRemaining.value = 40 * 60;
    currentQuestion.value = '';
    customQuestion.value = '';
};

// Cancel writing
const cancelWriting = () => {
    if (!hasStartedWriting.value || confirm('Are you sure you want to cancel? Your progress will be lost.')) {
        isWriting.value = false;
        hasStartedWriting.value = false;
        if (timer) clearInterval(timer);
    }
};

// Submit essay
const submitEssay = async () => {
    const userId = authStore.currentUser?.id;
    if (!userId) {
        notificationStore.error('Please log in to submit essays.');
        return;
    }

    try {
        const response = await writingApi.submitEssay({
            userId,
            taskType: 'task2',
            question: currentQuestion.value,
            essay: essay.value
        });

        submissions.value.unshift(response);
        isWriting.value = false;
        if (timer) clearInterval(timer);
        notificationStore.success('Essay submitted successfully!');
    } catch (error) {
        console.error('Error submitting essay:', error);
        notificationStore.error('Failed to submit essay. Please try again.');
    }
};

// View submission details
const viewSubmission = (submission: WritingSubmission) => {
    selectedSubmission.value = submission;
};

// Fetch submissions on component mount
onMounted(async () => {
    try {
        const userId = authStore.currentUser?.id;
        if (!userId) {
            notificationStore.error('Please log in to view your submissions.');
            return;
        }
        const response = await writingApi.getUserSubmissions(userId);
        submissions.value = response;
    } catch (error) {
        console.error('Error fetching submissions:', error);
        notificationStore.error('Failed to fetch submissions.');
    }
});

// Cleanup timer on component unmount
onUnmounted(() => {
    if (timer) {
        clearInterval(timer);
    }
});
</script>

<style scoped>
.writing-view {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
    min-height: calc(100vh - 4rem);
}

.page-title {
    font-size: 2.5rem;
    font-weight: 700;
    color: #1f2937;
    margin-bottom: 2rem;
    text-align: center;
    position: relative;
}

.page-title::after {
    content: '';
    display: block;
    width: 60px;
    height: 4px;
    background: linear-gradient(to right, #6366f1, #8b5cf6);
    margin: 1rem auto 0;
    border-radius: 2px;
}

/* Submissions List Styling */
.submissions-list {
    background: white;
    border-radius: 1rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    padding: 2rem;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
}

.section-header h2 {
    font-size: 1.5rem;
    font-weight: 600;
    color: #1f2937;
}

.primary-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: linear-gradient(to right, #6366f1, #8b5cf6);
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    font-weight: 500;
    transition: all 0.3s ease;
}

.primary-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.submissions-grid {
    display: grid;
    gap: 1.5rem;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}

.submission-card {
    background: white;
    border-radius: 1rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
    border: 1px solid #e5e7eb;
}

.submission-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 20px rgba(0, 0, 0, 0.1);
}

.submission-content {
    padding: 1.5rem;
}

.submission-header h3 {
    font-size: 1.1rem;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 1rem;
    line-height: 1.5;
}

.submission-meta {
    display: flex;
    gap: 1rem;
    margin-bottom: 0.5rem;
}

.word-count,
.band-score {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #6b7280;
    font-size: 0.9rem;
}

.submission-date {
    color: #9ca3af;
    font-size: 0.875rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.view-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    width: 100%;
    padding: 0.75rem;
    margin-top: 1rem;
    color: #6366f1;
    background: #e0e7ff;
    border-radius: 0.5rem;
    font-weight: 500;
    transition: all 0.2s ease;
}

.view-button:hover {
    background: #c7d2fe;
}

/* Writing Form Styling */
.writing-form {
    background: white;
    border-radius: 1rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    padding: 2rem;
}

.task-container {
    max-width: 800px;
    margin: 0 auto;
}

.task-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 1.5rem;
    text-align: center;
}

.question-input-section {
    margin-bottom: 2rem;
}

.section-subtitle {
    font-size: 1.25rem;
    color: #4b5563;
    margin-bottom: 1.5rem;
    text-align: center;
}

.question-options {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.sample-questions h4,
.custom-question h4 {
    font-size: 1.1rem;
    font-weight: 600;
    color: #374151;
    margin-bottom: 1rem;
}

.questions-grid {
    display: grid;
    gap: 1rem;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

.question-card {
    background: #f9fafb;
    border: 2px solid #e5e7eb;
    border-radius: 0.75rem;
    padding: 1.25rem;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
}

.question-card.selected {
    border-color: #6366f1;
    background: #f5f3ff;
}

.question-card p {
    font-size: 1rem;
    line-height: 1.5;
    color: #1f2937;
    margin-right: 2rem;
}

.select-button {
    position: absolute;
    top: 1rem;
    right: 1rem;
    color: #6366f1;
    font-size: 1.25rem;
}

.question-input {
    width: 100%;
    min-height: 120px;
    padding: 1rem;
    border: 2px solid #e5e7eb;
    border-radius: 0.75rem;
    font-size: 1rem;
    line-height: 1.5;
    resize: vertical;
    transition: all 0.2s ease;
}

.question-input:focus {
    border-color: #6366f1;
    outline: none;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.start-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 2rem;
}

.question-box {
    background: #f3f4f6;
    border-radius: 0.75rem;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
    font-size: 1.1rem;
    line-height: 1.6;
    color: #1f2937;
}

.writing-stats {
    display: flex;
    justify-content: space-between;
    margin-bottom: 1rem;
    padding: 1rem;
    background: #f9fafb;
    border-radius: 0.5rem;
}

.stat-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #4b5563;
}

.stat-item i {
    color: #6366f1;
}

.timer.warning {
    color: #ef4444;
}

.timer.warning i {
    color: #ef4444;
}

.essay-input {
    width: 100%;
    min-height: 400px;
    padding: 1rem;
    border: 2px solid #e5e7eb;
    border-radius: 0.5rem;
    margin-bottom: 1rem;
    font-size: 1rem;
    line-height: 1.6;
    resize: vertical;
    transition: border-color 0.2s ease;
}

.essay-input:focus {
    border-color: #6366f1;
    outline: none;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.action-buttons {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
}

.cancel-button,
.submit-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    font-weight: 500;
    transition: all 0.2s ease;
}

.cancel-button {
    color: #4b5563;
    background: #f3f4f6;
}

.cancel-button:hover {
    background: #e5e7eb;
}

.submit-button {
    color: white;
    background: #10b981;
}

.submit-button:hover:not(.disabled) {
    background: #059669;
}

.submit-button.disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* Submission Details Styling */
.submission-details {
    background: white;
    border-radius: 1rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    padding: 2rem;
}

.details-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
}

.details-header h2 {
    font-size: 1.5rem;
    font-weight: 600;
    color: #1f2937;
}

.back-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #6b7280;
    font-weight: 500;
    transition: color 0.2s ease;
}

.back-button:hover {
    color: #4b5563;
}

.details-container {
    max-width: 800px;
    margin: 0 auto;
}

.detail-section {
    margin-bottom: 2rem;
}

.detail-section h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 1rem;
}

.content-box {
    background: #f9fafb;
    border-radius: 0.75rem;
    padding: 1.5rem;
    line-height: 1.6;
}

.content-box.essay {
    position: relative;
    white-space: pre-wrap;
}

.word-count-badge {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: #6366f1;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 9999px;
    font-size: 0.875rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.assessment-grid {
    display: grid;
    gap: 1.5rem;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

.criterion-card {
    background: #f9fafb;
    border-radius: 0.75rem;
    padding: 1.5rem;
}

.criterion-card h4 {
    font-size: 1.1rem;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.band-badge {
    background: #6366f1;
    color: white;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.875rem;
}

.overall-score {
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    border-radius: 0.75rem;
    padding: 2rem;
    color: white;
    text-align: center;
}

.overall-score h3 {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
}

.score-badge {
    background: rgba(255, 255, 255, 0.2);
    padding: 0.5rem 1rem;
    border-radius: 9999px;
    font-size: 1.25rem;
}

.feedback-box {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 0.5rem;
    padding: 1.5rem;
    line-height: 1.6;
    white-space: pre-wrap;
}

@media (max-width: 768px) {
    .writing-view {
        padding: 1rem;
    }

    .page-title {
        font-size: 2rem;
    }

    .submissions-grid {
        grid-template-columns: 1fr;
    }

    .assessment-grid {
        grid-template-columns: 1fr;
    }

    .writing-stats {
        flex-direction: column;
        gap: 1rem;
    }

    .questions-grid {
        grid-template-columns: 1fr;
    }
}
</style>