# RTI-X Smart Scraper

This directory contains the Python-based data ingestion pipeline designed to keep `emergencyContacts.json` updated without breaking when government websites change their UI.

## How It Works

The `smart_scraper.py` pipeline utilizes a "Hybrid" approach, separating raw web fetching from data formatting:

### 1. The "Dumb" Scraper (`requests` + `BeautifulSoup`)
Traditional scrapers break when the government changes a table layout. Our scraper doesn't care about layout. It simply fetches the raw HTML from `ccmc.gov.in`, strips away all the scripts, styles, and headers, and extracts the raw, messy visible text. 
*   **Resilience:** It handles 404s and timeouts gracefully.

### 2. The Smart Normalizer (Groq LLM)
We pass the messy raw text into a high-speed LLM (like Groq) with a strict prompt:
> *"Extract the Officer Names and Phone Numbers. Output ONLY valid JSON matching our exact schema."*

*   **Intelligence:** The LLM acts as the parser. It ignores ads, fixes typos, maps Tamil designations to English, and outputs perfectly structured JSON data. It completely bypasses the need for fragile regex.
*   **Hackathon Mock Mode:** If no `GROQ_API_KEY` is provided, the script seamlessly falls back to a simulated LLM output so the demo pipeline never crashes.

### 3. The Diff Engine
The script reads the new JSON from the LLM and merges it into our production `src/data/emergencyContacts.json`. 
*   It specifically targets the `ROAD_INFRASTRUCTURE` and `WATER_SUPPLY` departments.
*   It automatically updates the `verifiedAt` timestamp so the frontend UI can prove to the citizen exactly when the government data was last checked.

## Running the Scraper
You will need a Python environment to run this script.

```bash
# 1. Install dependencies
pip install requests beautifulsoup4 groq

# 2. Run the pipeline
python smart_scraper.py
```
