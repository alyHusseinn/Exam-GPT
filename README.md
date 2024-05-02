## Exam GPT Web Application

### Teacher's Workflow:
1. **Login/Register:** Teachers can create accounts or log in.
2. **Create Exams:**
   - Specify exam details:
     - Topic
     - Number of questions
     - Type of exam (Essay, MCQ, Oral)
3. **Generate Exam Content:** Utilize OpenAI API to create exam questions and answer keys.
4. **Review Submissions:** For oral exams, listen to student recordings and provide evaluations.

### Student's Workflow:
1. **Login/Register:** Students create accounts or log in.
2. **View Available Exams:** See exams created by teachers.
3. **Take Exams:**
   - For MCQ and Essay exams:
     - Answer questions directly in the web app.
     - Receive instant feedback.
   - For Oral exams:
     - Record oral responses.
     - Submit recordings for teacher evaluation.
4. **View Results:** Access results immediately after completing MCQ or Essay exams.

### Application Features:
- **Exam Creation:** User-friendly interface for teachers to specify exam details.
- **OpenAI Integration:** Use OpenAI API to generate exam content.
- **Exam Types:**
  - **MCQ:** Auto-grade and provide instant feedback.
  - **Essay:** Allow free-form text responses, uses AI for evaluation.
  - **Oral:** Implement voice recording and submission for teacher evaluation.
- **Student Interface:** Simple and intuitive interface for exam access and submission.
- **Teacher Interface:** Dashboard for reviewing submissions, providing feedback, and grading.
- **Secure User Authentication:** Implement secure authentication methods.

### Technologies:
- **Backend:** Nodejs, Express.js for server-side logic.
- **Frontend:** JavaScript/ejs/tailwindCSS for user interface.
- **Database:** MongoDB for data storage and mongoose as an ORM.
- **API Integration:** OpenAI API for exam content generation and evaluation.
- **User Authentication:** Use JWT for secure authentication.

### Database Diagram
<img src="./docs/DB-Digram.png">