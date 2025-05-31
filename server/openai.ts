import OpenAI from "openai";
import type { Article } from "./types";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || process.env.API_KEY
});

export interface EnhancedArticleContent {
  enhancedContent: string;
  summary: string;
  readingTime: number;
}

export async function enhanceArticle(article: Article): Promise<EnhancedArticleContent> {
  try {
    const prompt = `
You are an expert news editor and content enhancer. Your task is to take a news article and enhance it while maintaining journalistic integrity and accuracy.

Original Article:
Title: ${article.title}
Content: ${article.content}
Source: ${article.sourceName}
Category: ${article.category}

Please enhance this article by:
1. Expanding on key points with additional context and background information
2. Adding relevant details that would help readers understand the full scope of the story
3. Improving the narrative flow and readability
4. Maintaining factual accuracy and journalistic standards
5. Creating a compelling but balanced presentation

Also provide:
- A concise summary (2-3 sentences)
- Estimated reading time in minutes

Respond with JSON in this exact format:
{
  "enhancedContent": "The enhanced article content here...",
  "summary": "Concise 2-3 sentence summary...",
  "readingTime": 5
}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert news editor who enhances articles while maintaining journalistic integrity. Always respond with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 2000,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      enhancedContent: result.enhancedContent || article.content,
      summary: result.summary || article.summary,
      readingTime: Math.max(1, Math.min(15, result.readingTime || 5))
    };
  } catch (error) {
    console.error('Failed to enhance article:', error);
    throw new Error('Failed to enhance article with AI: ' + (error as Error).message);
  }
}

export async function generateArticleSummary(content: string, title: string): Promise<string> {
  try {
    const prompt = `
Summarize this news article in 2-3 clear, concise sentences that capture the main points and significance:

Title: ${title}
Content: ${content}

Provide a summary that would help someone quickly understand what happened and why it matters.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a news editor who creates clear, concise summaries of articles."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 200,
    });

    return response.choices[0].message.content || '';
  } catch (error) {
    console.error('Failed to generate summary:', error);
    throw new Error('Failed to generate article summary: ' + (error as Error).message);
  }
}

export async function convertTextToSpeech(text: string, title: string): Promise<Buffer> {
  try {
    // Prepare the text for speech synthesis
    const speechText = `
Breaking News: ${title}

${text}

This was your AI News Radio report.
`;

    const response = await openai.audio.speech.create({
      model: "tts-1-hd",
      voice: "nova", // Professional, clear voice suitable for news
      input: speechText.substring(0, 4096), // OpenAI TTS has a character limit
      speed: 1.0,
    });

    const buffer = Buffer.from(await response.arrayBuffer());
    return buffer;
  } catch (error) {
    console.error('Failed to convert text to speech:', error);
    throw new Error('Failed to convert article to audio: ' + (error as Error).message);
  }
}

export async function categorizeArticle(title: string, content: string): Promise<string> {
  try {
    const prompt = `
Analyze this news article and categorize it into one of these categories:
- Breaking
- Politics  
- Technology
- Business
- Sports
- Health
- Entertainment
- Science

Title: ${title}
Content: ${content.substring(0, 1000)}

Respond with JSON in this format:
{
  "category": "Technology",
  "confidence": 0.95,
  "reasoning": "Brief explanation of why this category was chosen"
}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert news categorization system. Analyze the content and provide the most appropriate category."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 150,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return result.category || 'Breaking';
  } catch (error) {
    console.error('Failed to categorize article:', error);
    return 'Breaking'; // Default fallback
  }
}

export async function extractKeyTopics(articles: Article[]): Promise<string[]> {
  try {
    const titlesAndSummaries = articles.slice(0, 10).map(article => 
      `${article.title}: ${article.summary}`
    ).join('\n\n');

    const prompt = `
Analyze these news articles and extract the top 5-8 trending topics or themes. Focus on current events, technologies, people, or issues that appear frequently or are particularly significant.

Articles:
${titlesAndSummaries}

Respond with JSON in this format:
{
  "topics": ["Topic 1", "Topic 2", "Topic 3", ...],
  "reasoning": "Brief explanation of the trending themes identified"
}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a news trend analyst who identifies important topics and themes from multiple articles."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 300,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return result.topics || [];
  } catch (error) {
    console.error('Failed to extract key topics:', error);
    return [];
  }
}

export async function generateNewsInsight(articles: Article[]): Promise<string> {
  try {
    const recentArticles = articles.slice(0, 5).map(article => 
      `${article.title} (${article.category}): ${article.summary}`
    ).join('\n\n');

    const prompt = `
Based on these recent news articles, provide a brief insight or analysis about current trends, patterns, or significant developments. Write this as if you're a news analyst providing context to listeners.

Recent Articles:
${recentArticles}

Write a 2-3 sentence insight that connects these stories or highlights what's significant about current events.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a thoughtful news analyst who provides context and insights about current events."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 200,
    });

    return response.choices[0].message.content || '';
  } catch (error) {
    console.error('Failed to generate news insight:', error);
    return '';
  }
}

export { openai };
