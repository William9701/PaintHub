---

# Sweet Touch Project

Welcome to Sweet Touch – your ultimate destination for all things painting-related! Whether you're a DIY enthusiast, a professional painter, or someone in need of expert assistance, Sweet Touch has you covered. This README provides an overview of the project structure, setup instructions, and key functionalities.

## Overview

Sweet Touch is a web application designed to simplify the painting process for users. From calculating paint quantities to hiring skilled painters, our platform offers a comprehensive suite of tools and services to meet your needs. Built using Python, Flask, and JavaScript, Sweet Touch combines intuitive design with powerful functionality to deliver an exceptional user experience.

## Project Structure

The project structure is organized into two main components:

1. **API**: The API component handles data retrieval and manipulation, serving as the backend for the Sweet Touch platform. It is located in the `api` directory.

2. **Web Application**: The web application component encompasses the frontend user interface and interactive features. It is located in the `web_dynamic` directory.

## Setup Instructions

To set up the Sweet Touch project locally, follow these steps:

1. Clone the repository to your local machine:

   ```bash
   git clone https://github.com/William9701/paintHub.git
   ```

2. Navigate to the project directory:

   ```bash
   cd paintHub
   ```

3. Install the required dependencies:

   ```bash
   pip install -r requirements.txt
   ```

## Running the Application

To run the Sweet Touch application locally, follow these steps:

1. Start the API server:

   ```bash
   python -m api.v1.app
   ```

2. Start the web application server:

   ```bash
   python -m web_dynamic.paintHub
   ```

3. Access the Sweet Touch platform in your web browser at `http://localhost:5000`.

## Key Functionalities

1. **Paint Quantity Calculation**: Users can input the area of their painting project and receive accurate paint quantity estimates.

2. **Painter Hiring**: Users can browse and hire skilled painters from our network of professionals.

3. **Product Purchasing**: A seamless shopping experience allows users to browse, select, and purchase painting products directly from the platform.

4. **User Authentication**: Secure user authentication and registration processes ensure safe access to platform features.

5. **Career Opportunities**: Aspiring painters can apply for job opportunities and join the Sweet Touch team through the career portal.

## Contributors

- Obi William (@williamobi818@gmail.com)


## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact

For inquiries or support, please contact us at contact@sweettouch.com.

---
