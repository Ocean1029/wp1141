# Y

A Twitter-like social media platform built with Next.js 16, featuring OAuth authentication, real-time interactions, and threaded conversations. This platform provides a complete social media experience from user registration to content creation, social interactions, and profile management.

## Live Demo

The application is deployed on Vercel and can be accessed at the following URL:

**Production Deployment**: [https://wp1141-eta.vercel.app/](https://wp1141-eta.vercel.app/)

## Overview

This project is a full-stack social media platform inspired by X (formerly Twitter), designed as a minimal viable product that focuses on core social networking features. The platform enables users to create accounts through OAuth providers, publish posts with rich text formatting, engage with content through likes and reposts, participate in threaded conversations, and manage their personal profiles. The system is built with modern web technologies to ensure scalability, real-time responsiveness, and a smooth user experience.

The architecture follows a serverless approach using Next.js App Router, which allows for efficient server-side rendering and API route handling. All database operations are managed through Prisma ORM, providing type-safe database access and automatic schema migrations. Real-time features are powered by Pusher, enabling instant updates across all connected clients when users interact with content.

## Features

### Authentication and User Management

The platform supports multiple OAuth providers including Google, GitHub, and Facebook, allowing users to sign in with their existing accounts. After initial OAuth authentication, users are prompted to create a custom userID, which serves as their unique handle on the platform. The userID validation ensures that handles are between 3 and 20 characters, contain only alphanumeric characters and underscores, and follow specific formatting rules to maintain consistency across the platform.

User profiles can be customized with avatar images, banner images, biographical information, and external links. The profile editing interface provides a seamless experience for updating personal information, with image uploads handled through Cloudinary integration. Users can view their own profiles in edit mode or browse other users' profiles in read-only mode, with appropriate action buttons displayed based on the viewing context.

### Content Creation and Management

Users can create posts with a maximum length of 280 characters, following the standard microblogging format. The text editor includes intelligent parsing for URLs, hashtags, and mentions, with each element properly highlighted and clickable. URLs are automatically detected and shortened to a standard 23-character count for the purpose of character limit calculation, while hashtags and mentions are not counted toward the character limit.

The platform supports draft functionality, allowing users to save incomplete posts and return to them later. Drafts are stored in the same database table as published posts, differentiated by an `isDraft` flag, which enables efficient querying and management. When composing a post, users can choose to publish immediately, save as draft, or discard the content with a confirmation dialog to prevent accidental data loss.

### Social Interactions

The platform implements a comprehensive interaction system that includes likes, reposts, and comments. Each interaction is tracked individually, with counters maintained on the post model to enable efficient querying without requiring complex joins. The like and repost systems use toggle functionality, meaning users can like or unlike a post, repost or undo a repost, with the system automatically handling the state changes.

Comments are implemented as a threaded conversation system, where each reply is linked to its parent post through a recursive relationship. This allows for nested conversations of unlimited depth, with each thread maintaining its own context and conversation flow. The thread view provides navigation controls to move between different levels of the conversation, ensuring users can always understand the context of their current position in the discussion.

### Real-time Updates

Real-time functionality is implemented using Pusher, a hosted WebSocket service that enables instant updates across all connected clients. When a user likes, reposts, or comments on a post, the action is processed on the server, the database is updated within a transaction to ensure data consistency, and then a Pusher event is broadcast to all clients subscribed to that post's channel.

This approach ensures that users see interactions as they happen, creating a dynamic and engaging experience. The real-time system is designed to be efficient, with each post having its own channel, and events being scoped to minimize unnecessary network traffic. The implementation handles connection management, reconnection logic, and error states to provide a robust real-time experience.

### Feed System

The home feed provides two distinct views: All posts and Following posts. The All posts view displays every published post in reverse chronological order, giving users a comprehensive view of platform activity. The Following view filters posts to show only content from users that the current user follows, creating a personalized feed experience.

Both feeds support infinite scrolling, with posts loaded in batches to optimize performance and reduce initial page load time. The feed components are optimized for rendering performance, using React's virtualization capabilities where appropriate to handle large lists efficiently. Each post card displays the author information, post content with parsed formatting, interaction counts, and action buttons, all styled consistently using Tailwind CSS.

## Technology Stack

### Frontend Framework

The application is built using Next.js 16 with the App Router architecture, which provides a modern approach to React application development. The App Router enables server components, which run on the server and can directly access databases and APIs, reducing client-side JavaScript and improving initial page load performance. Client components are used selectively for interactive elements that require browser APIs or user interactions.

TypeScript is used throughout the project to provide type safety and improve developer experience. The type system helps catch errors at compile time and provides better IDE support with autocomplete and refactoring capabilities. All components, server actions, and utility functions are fully typed, ensuring consistency across the codebase.

### Styling and UI Components

Tailwind CSS v4 is used for styling, providing a utility-first approach that enables rapid UI development while maintaining consistency. The styling follows a design system with consistent spacing, colors, and typography scales. The BEM (Block Element Modifier) naming convention is used for CSS class organization, ensuring maintainability and clarity in the stylesheet structure.

Lucide React provides the icon library, offering a comprehensive set of icons that are consistent in style and optimized for performance. Icons are used throughout the interface to provide visual cues and improve usability, with appropriate sizing and coloring to match the overall design language.

### Database and ORM

PostgreSQL serves as the primary database, chosen for its reliability, performance, and support for complex queries and transactions. The database schema is managed through Prisma, an ORM that provides type-safe database access and automatic migration generation. Prisma's schema file serves as the single source of truth for the database structure, and migrations are version-controlled to track schema changes over time.

The database design follows normalization principles while maintaining query performance through strategic indexing. Composite indexes are used for common query patterns, such as fetching posts by author and creation date, or finding replies to a specific post. The schema includes soft delete functionality for posts, allowing content to be marked as deleted without permanently removing it from the database.

### Authentication

NextAuth v5 handles authentication, providing a flexible and secure authentication system that supports multiple OAuth providers. The authentication flow includes session management with JWT tokens, automatic token refresh, and secure cookie handling. The system integrates with Prisma through the Prisma adapter, storing user accounts, sessions, and verification tokens in the database.

The authentication middleware protects routes that require user authentication, redirecting unauthenticated users to the login page. Session validation occurs on both the client and server sides, ensuring that protected server actions can verify the user's identity before processing requests.

### Real-time Communication

Pusher provides the real-time communication infrastructure, handling WebSocket connections and message broadcasting. The platform uses Pusher Channels, which provides a publish-subscribe model where clients subscribe to channels and receive events published to those channels. Each post has its own channel, identified by the post ID, allowing targeted updates for specific content.

The Pusher integration includes authentication to ensure that only authorized clients can subscribe to channels. The authentication endpoint verifies the user's session and generates appropriate channel authorization tokens. Error handling and reconnection logic are implemented to handle network interruptions gracefully.

### File Storage

Cloudinary is used for image storage and processing, providing a cloud-based solution for handling user-uploaded images. The service automatically optimizes images for web delivery, provides responsive image URLs, and handles transformations such as resizing and cropping. This integration simplifies the image upload process and ensures that images are delivered efficiently to users.

## Project Structure

The project follows a well-organized directory structure that separates concerns and makes the codebase maintainable. The `app` directory contains Next.js routes, organized into route groups for authentication and main application routes. Server actions are located in the `lib/server` directory, providing a centralized location for all server-side business logic.

Components are organized by feature area, with each directory containing related components and their styles. This organization makes it easy to locate components and understand their relationships. Utility functions are placed in the `lib/utils` directory, with each utility file focused on a specific concern such as text parsing, time formatting, or user ID validation.

The Prisma schema and migrations are stored in the `prisma` directory, maintaining a clear separation between database concerns and application logic. Environment configuration is managed through separate files for development and production environments, with an example file provided as a template for setting up new environments.

## Getting Started

### Prerequisites

Before starting development, ensure you have Docker and Docker Compose installed on your system. Docker is used to run the PostgreSQL database in a containerized environment, eliminating the need for local database installation and configuration. Docker Compose manages the database service and provides easy commands for starting, stopping, and managing the development environment.

You will also need OAuth application credentials from at least one provider (Google, GitHub, or Facebook). These credentials are obtained by creating applications in each provider's developer console and configuring the appropriate callback URLs. Additionally, a Pusher account is required for real-time functionality, which can be created at pusher.com with a free tier available for development purposes.

### Initial Setup

The project includes a Makefile that provides convenient commands for common development tasks. To initialize the project, run `make init`, which creates environment files from templates. These environment files need to be populated with your OAuth credentials, Pusher configuration, and other required environment variables.

The development environment uses Docker Compose profiles to separate development and production configurations. This allows the same docker-compose.yml file to be used for both environments, with different settings applied based on the active profile. The development profile uses hot reload for the Next.js application and includes development-friendly database settings.

### Starting the Development Server

To start the development environment, run `make up`, which starts the PostgreSQL database container and the Next.js development server. The database is automatically configured with the correct connection string, and the Next.js server runs with hot module replacement enabled for rapid development iteration.

## Environment Configuration

Environment variables are managed through separate files for development and production environments. The `.env.dev` file is used for local development, while `.env.prod` is used for production deployments. An `.env.example` file serves as a template, documenting all required environment variables and their purposes.

The database connection string is automatically configured by Docker Compose for the development environment, so you don't need to manually set the `DATABASE_URL` variable when running locally. For production deployments, you'll need to provide a `DATABASE_URL` that points to your production database instance.

OAuth provider credentials must be configured for each provider you want to support. The `NEXTAUTH_URL` variable must match your application's URL, as it's used to construct callback URLs for OAuth providers. The `NEXTAUTH_SECRET` should be a randomly generated string, which can be created using OpenSSL or similar tools.

Pusher configuration requires both server-side and client-side credentials. The server-side credentials (`PUSHER_APP_ID`, `PUSHER_KEY`, `PUSHER_SECRET`) are used for authentication and publishing events, while the client-side credentials (`NEXT_PUBLIC_PUSHER_KEY`, `NEXT_PUBLIC_PUSHER_CLUSTER`) are exposed to the browser for establishing WebSocket connections.

## Available Commands

The Makefile provides a comprehensive set of commands for managing the development and production environments. Development commands use the `-dev` suffix and are the default when no suffix is specified. Production commands use the `-prod` suffix and are used for testing production builds locally.

The `make up-dev` command starts all development services, including the database and Next.js server. The `make down-dev` command stops all services and removes containers, while `make logs-dev` displays logs from all running services. The `make db-setup-dev` command initializes the database schema, and `make db-studio-dev` opens Prisma Studio for database management.

Production commands follow the same pattern but use production-specific configurations. The `make build-prod` command builds production-optimized Docker images, while `make up-prod` starts services using those images. These commands are useful for testing production builds locally before deploying to Vercel.

Shortcut commands are available that default to development mode. The `make up` command is an alias for `make up-dev`, `make down` is an alias for `make down-dev`, and `make logs` is an alias for `make logs-dev`. The `make clean` command removes all development resources, including containers, volumes, and generated files.

## Deployment

The application is designed to be deployed on Vercel, which provides seamless integration with Next.js and automatic deployments from GitHub. The deployment process is automated through Vercel's CI/CD pipeline, which builds and deploys the application whenever changes are pushed to the main branch.

Before deploying, you need to configure environment variables in the Vercel project settings. All environment variables used in the application must be set in Vercel's dashboard, with separate values for production, preview, and development environments. The database connection string should point to your production database instance, which can be hosted on services like Vercel Postgres, Supabase, Neon, or Railway.

The build process includes generating the Prisma Client and running database migrations. The `vercel.json` file configures the build command to include `npx prisma generate`, ensuring that the Prisma Client is available during the build process. Database migrations should be run after the initial deployment using `npx prisma migrate deploy`, which applies all pending migrations to the production database.

OAuth provider callback URLs must be updated to point to your production domain. Each OAuth provider requires you to register the callback URL in their developer console, and this URL must match the `NEXTAUTH_URL` environment variable. Failure to configure these URLs correctly will result in authentication failures.

## Development Status

The project has reached a stable state with all core features implemented and tested. The authentication system supports multiple OAuth providers and includes a custom userID registration flow. Content creation features are fully functional, including post composition, draft management, and text parsing for URLs, hashtags, and mentions.

Social interaction features are complete, with likes, reposts, and comments all working correctly. The threaded conversation system supports unlimited nesting depth, and the thread navigation provides a smooth user experience. Real-time updates are implemented using Pusher, ensuring that interactions appear instantly across all connected clients.

The profile system allows users to customize their profiles with images and biographical information, and the follow system enables users to build their social network. The feed system provides both global and personalized views, with efficient querying and rendering optimizations.

All database operations use transactions where appropriate to ensure data consistency, and the application includes proper error handling and validation. The codebase follows TypeScript best practices and includes comprehensive type definitions throughout.

## License

This project is licensed under the MIT License, which allows for free use, modification, and distribution. The license provides flexibility for both personal and commercial use while maintaining attribution requirements.
