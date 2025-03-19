# Alvenio - Video-Based Loan Assistance

An AI-powered virtual branch manager that provides a seamless, interactive loan application experience through video-based conversations.

## Features

- 🤖 Virtual Alvenio with pre-recorded video interactions
- 📹 Video-based customer interaction with facial verification
- 📄 Simplified document submission and processing
- ✅ Instant loan eligibility assessment
- 🌐 Multi-language support (coming soon)

## Tech Stack

### Backend
- Python 3.9+
- FastAPI
- OpenCV for video processing
- Tesseract OCR for document analysis
- SQLAlchemy for database management
- Pydantic for data validation

### Frontend
- React 18
- TypeScript
- Tailwind CSS
- WebRTC for video interactions
- Axios for API communication

## Setup Instructions

### Prerequisites
- Python 3.9 or higher
- Node.js 16 or higher
- PostgreSQL
- Tesseract OCR

### Backend Setup
1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
cd backend
pip install -r requirements.txt
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Run the backend:
```bash
uvicorn main:app --reload
```

### Frontend Setup
1. Install dependencies:
```bash
cd frontend
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Run the development server:
```bash
npm run dev
```

## Project Structure
```
ai-branch-manager/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── models/
│   │   └── services/
│   ├── tests/
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── utils/
│   └── package.json
└── README.md
```

## Contributing
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License
This project is licensed under the MIT License - see the LICENSE file for details. 