# Django Todo App

A modern, card-based Todo application built with Django and Tailwind CSS.

## Features
- **Dashboard**: View tasks by status (Pending, Due Soon, Completed).
- **Create/Edit**: Modal-based forms for seamless user experience.
- **Search & Filter**: Filter by status/date and search by text.
- **Inline Actions**: Mark tasks as resolved/pending directly from the card.
- **Responsive Design**: Fully responsive layout using Tailwind CSS.

## Setup Instructions

### Prerequisites
- Python 3.8+ installed.

### Installation

1. **Clone/Navigate to the project**:
   ```bash
   cd todo_project
   ```

2. **Create and Activate Virtual Environment**:
   ```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate

   # Linux/macOS
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install Dependencies**:
   ```bash
   pip install django
   ```

4. **Run Migrations**:
   ```bash
   python manage.py migrate
   ```

5. **Run the Server**:
   ```bash
   python manage.py runserver
   ```

6. **Access the App**:
   Open your browser and go to `http://127.0.0.1:8000/`.

## Project Structure
- `tasks/`: Django app containing models, views, and forms.
- `templates/`: HTML templates styled with Tailwind CSS.
- `todo_project/`: Main project configuration.
