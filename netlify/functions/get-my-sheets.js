// netlify/functions/fetch-sheets-data.js

const { GoogleAuth } = require('google-auth-library'); // Non useremo GoogleAuth per API Key pubblica
const { google } = require('googleapis'); // Non useremo googleapis per API Key pubblica
const fetch = require('node-fetch'); // Per fare chiamate HTTP da Node.js

// Importante: La tua API Key NON deve essere qui. Verrà letta dalle variabili d'ambiente.

exports.handler = async function(event, context) {
  // Debug: Stampa l'URL del foglio e il range che ti aspetti dal client
  console.log("Function invoked.");
  console.log("Sheet ID from client:", event.queryStringParameters.sheetId);
  console.log("Sheet Range from client:", event.queryStringParameters.sheetRange);

  // Recupera la API Key dalle variabili d'ambiente di Netlify.
  // Assicurati che il nome 'GOOGLE_SHEETS_API_KEY' corrisponda a quello che configurerai in Netlify.
  const apiKey = process.env.GOOGLE_SHEETS_API_KEY;

  if (!apiKey) {
    console.error("GOOGLE_SHEETS_API_KEY non è configurata come variabile d'ambiente.");
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server configuration error: API Key missing." }),
    };
  }

  // Costruisce l'URL per l'API di Google Sheets utilizzando i parametri passati dal frontend
  // e la API Key sicura.
  const sheetID = event.queryStringParameters.sheetId;
  const sheetRange = event.queryStringParameters.sheetRange;

  if (!sheetID || !sheetRange) {
      console.error("Parametri sheetId o sheetRange mancanti dalla richiesta del client.");
      return {
          statusCode: 400,
          body: JSON.stringify({ error: "Missing required parameters: sheetId or sheetRange." }),
      };
  }

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetID}/values/${sheetRange}?key=${apiKey}`;
  console.log("Calling Google Sheets API URL:", url); // Debug: l'URL della chiamata all'API Sheets

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
        console.error("Error from Google Sheets API:", data);
        return {
            statusCode: response.status,
            body: JSON.stringify({ error: data.error.message || "Error fetching data from Google Sheets." }),
        };
    }
    
    // Ritorna i dati al frontend
    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };

  } catch (error) {
    console.error("Serverless Function error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch data due to serverless function error." }),
    };
  }
};