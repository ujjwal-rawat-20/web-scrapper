## Overview

This project implements web scraping functionality to extract data about companies based on location, employees, and industry. The extracted data is saved in an Excel file. The project uses Node.js for the backend and the Puppeteer library for scraping the data from the web.

## Features

* **Login Functionality** : Users can log in using their credentials (ID and password) to access the targeted website.
* **Search Companies by Location** : Users can search for companies based on location.
* **Search Companies by Employees** : Users can search for companies based on the number of employees working there.
* **Search Companies by Industry** : Users can search for companies based on the industry they operate in.
* **Data Extraction** : Data about the companies, including their location, employees, and industry, is scraped from the website.
* **Data Export** : The scraped data is saved in an Excel file for further analysis and processing.

## Technologies Used

* **Node.js** : Node.js is used as the backend runtime environment for executing JavaScript code.
* **Puppeteer** : Puppeteer is a Node.js library that provides a high-level API to control headless Chrome or Chromium, enabling web scraping and automated testing of web pages.

## Installation

1. Clone the repository to your local machine.
2. Install Node.js if you haven't already.
3. Install the required dependencies by running `npm install`.

## Usage

1. Configure your login credentials (ID and password) in the appropriate configuration file.
2. Run the application using `npm start`.
3. The application will log in to the website, perform the specified searches, scrape the data, and save it to an Excel file.

## Configuration

* **Login Credentials** : Update the `config.json` file with your login credentials.
* **Search Parameters** : Customize the search parameters (location, number of employees, industry) in the application code as needed.

## Installation
* **Prerequisites**
Before you begin, ensure you have the following installed on your system:

* **Node.js** : Make sure you have Node.js installed on your machine. You can download and install it from Node.js website.

## Steps
Follow these steps to set up and run the project:

1: Clone the Repository:

2: Navigate to the Project Directory:

3: Install Dependencies:

4: Configure Login Credentials:

5: Customize Search Parameters (Optional):

6: Run the Application:(npm start)