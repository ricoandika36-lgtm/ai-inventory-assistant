AI-Powered Inventory Management Assistant

A simple inventory management web application integrated with an AI Assistant to help small businesses manage, monitor, and understand their inventory more efficiently.

Overview

AI-Powered Inventory Management Assistant is a lightweight web application designed to simplify inventory management for small and medium-sized businesses (SMEs).

The application combines basic inventory management features with an AI Assistant that helps users analyze stock conditions, identify low-stock products, generate inventory summaries, and provide simple restocking recommendations.

The main goal is to make inventory information easier to access and help business owners make better stock management decisions.

Features

Inventory Management

- Inventory dashboard with stock statistics.
- Product inventory table.
- Add and delete inventory items.
- Search products by name.
- Low-stock indicators.
- Local data persistence using LocalStorage.

AI Inventory Assistant

- Interactive chat interface.
- Answer questions about inventory data.
- Identify products with low stock levels.
- Generate inventory summaries.
- Provide restocking recommendations.
- Explain recommendations based on available inventory data.

Technology Stack

Technology| Purpose
HTML5| Application structure
CSS3| Styling and responsive layout
JavaScript| Application logic and interactions
LocalStorage| Local inventory data persistence
IBM Bob| AI-assisted development

Project Structure

ai-inventory-assistant/
│
├── index.html
├── style.css
├── script.js
│
├── assets/
│   └── images/
│
├── screenshots/
│
└── README.md

Getting Started

Prerequisites

- A modern web browser.
- A code editor (Visual Studio Code recommended).

Installation

1. Clone the repository:

git clone https://github.com/YOUR-USERNAME/ai-inventory-assistant.git

2. Navigate to the project directory:

cd ai-inventory-assistant

3. Open "index.html" in your browser.

No additional package installation is required for the basic frontend application.

AI Assistant Capabilities

The AI Assistant is designed to support inventory-related questions and provide insights based on available inventory information.

Example interactions:

User:
Which products have stock levels below 5 units?

AI Assistant:
The following products have stock levels below 5 units. These items should be considered for restocking.

User:
Give me an overview of my inventory.

AI Assistant:
The assistant provides a summary of available products and their current stock conditions.

Note: AI response capabilities depend on the implemented AI integration and available inventory data.

Future Improvements

Potential future enhancements include:

- Database integration for persistent inventory management.
- Sales trend analysis.
- Machine learning-based stock prediction.
- Automated low-stock notifications.
- AI-powered purchasing recommendations.
- Integration with sales and business management systems.

Project Purpose

This project was developed as part of the UNSIA × Hacktiv8 Capstone Project to explore AI Agent development, prompt engineering, and practical applications of AI in business operations.

Author

Developed by Rico Andika

License

This project is intended for educational and learning purposes.
