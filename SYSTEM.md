# NIA-AUTOMATION System

## Overview

NIA-AUTOMATION is an AI-powered document processing system that enables users to upload multiple PDF files containing tabular data, automatically extract and analyze the content, and generate comprehensive summaries.

## Core Concept

The system processes PDF documents with tables through an intelligent AI pipeline that reads, interprets, and consolidates information from multiple files into actionable summaries.

## Key Features

### Multi-File Upload
- Users can upload multiple PDF files simultaneously
- Each file contains tables with structured data
- System handles batch processing of documents

### AI-Powered Analysis
- AI reads each PDF file sequentially
- Extracts tabular data from PDF documents
- Interprets and understands table structures and content
- Processes information across multiple documents

### Intelligent Summarization
- Consolidates data from all uploaded files
- Generates comprehensive summaries
- Presents insights in a digestible format

## Technology Stack

### Frontend
- Next.js with TypeScript (strict mode)
- React Server Components and Client Components
- Modern, responsive UI

### Backend
- Next.js API routes (serverless functions on Vercel)
- Firebase Firestore for data storage
- Firebase Storage for PDF file management
- Service account authentication for secure backend operations

### AI Integration
- **Google Gemini 3 Flash** as primary AI engine
- PDF parsing and table extraction
- Natural language processing for summarization
- Sequential document analysis with intelligent reasoning
- Multi-modal processing for text, images, and tables

## Architecture Principles

### Security First
- All Firebase operations use service account keys on backend
- Client-side never directly accesses Firestore or Storage
- API routes handle all sensitive operations
- Request flow: Guards → Validation → Business Logic → Side Effects → Response

### Scalability
- Serverless architecture on Vercel
- Optimized for handling multiple concurrent users
- Efficient batch processing of documents
- Minimal Firebase reads/writes through caching

### User Experience
- Simple, intuitive upload interface
- Real-time processing feedback
- Clear error messages in human-readable language
- Graceful handling of edge cases

## Data Flow

1. User uploads PDF files through frontend
2. Files sent to API route with authentication
3. Backend validates and stores files in Firebase Storage
4. AI processes each PDF sequentially
5. Extracted data stored in Firestore
6. Summary generated from consolidated data
7. Results returned to user

## Development Standards

- TypeScript strict mode enforced
- Modular architecture with clear separation of concerns
- Service layers for all Firebase interactions
- No inline database queries in components
- ESLint + Prettier for code quality
- Simple, readable code over complex solutions

## AI Engine: Gemini 3 Flash

### Why Gemini 3 Flash?
- Released December 2025 with cutting-edge performance
- Handles 50+ page PDFs with 1M token context window
- Three thinking modes: Fast, Thinking, and Pro
- Native multimodal support for tables and structured data
- 10x more cost-effective than competing models
- Low-latency processing for excellent user experience
- PhD-level reasoning capabilities for complex document analysis

### Processing Capabilities
- Up to 50 pages per PDF file
- Multiple PDFs processed sequentially
- Intelligent table recognition and extraction
- Context-aware summarization across documents
- Structured data interpretation

### Implementation Approach
- Gemini API integration via Google AI SDK
- Thinking mode for document analysis
- Batch processing for multiple files
- Streaming responses for real-time feedback

## Future Considerations

- Support for various table formats
- Advanced AI analysis capabilities with Gemini 3 Pro
- Export options for summaries
- Historical data tracking
- User workspace management
