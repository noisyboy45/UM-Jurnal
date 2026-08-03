# UM Jurnal - Journal Management System

A complete Journal Management System built with Node.js, Express.js, Prisma ORM, and vanilla JavaScript frontend.

## Features

- User Registration & Login (JWT Authentication)
- Dashboard for managing content
- CRUD Articles (with thumbnail upload)
- CRUD Books (with cover & PDF upload)
- CRUD Scientific Works (with PDF upload)
- File upload with Multer
- Ownership validation (users can only edit/delete their own content)

## Tech Stack

**Backend:**
- Node.js + Express.js
- Prisma ORM (SQLite)
- JWT Authentication
- bcryptjs (password hashing)
- Multer (file upload)

**Frontend:**
- HTML, CSS (Tailwind)
- Vanilla JavaScript (Fetch API)

## Installation

```bash
# Clone the repository
git clone <repo-url>
cd UM-Jurnal

# Install server dependencies
cd server
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your settings

# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push

# Start development server
npm run dev
```

## Environment Variables

Create `server/.env`:

```
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key"
PORT=5000
```

## Running the Server

```bash
cd server
npm run dev
```

The server runs on `http://localhost:5000`.

- Frontend: `http://localhost:5000/index.html`
- API: `http://localhost:5000/api`

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login | No |
| GET | `/api/auth/me` | Get current user | Yes |
| POST | `/api/auth/logout` | Logout | Yes |

### Articles

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/articles` | List all articles | No |
| GET | `/api/articles/:id` | Get article by ID | No |
| POST | `/api/articles` | Create article | Yes |
| PUT | `/api/articles/:id` | Update article | Yes |
| DELETE | `/api/articles/:id` | Delete article | Yes |

### Books

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/books` | List all books | No |
| GET | `/api/books/:id` | Get book by ID | No |
| POST | `/api/books` | Create book | Yes |
| PUT | `/api/books/:id` | Update book | Yes |
| DELETE | `/api/books/:id` | Delete book | Yes |

### Scientific Works

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/scientific` | List all scientific works | No |
| GET | `/api/scientific/:id` | Get scientific work by ID | No |
| POST | `/api/scientific` | Create scientific work | Yes |
| PUT | `/api/scientific/:id` | Update scientific work | Yes |
| DELETE | `/api/scientific/:id` | Delete scientific work | Yes |

## Folder Structure

```
UM-Jurnal/
├── index.html
├── pages/
│   ├── login.html
│   ├── daftar.html
│   ├── artikel.html
│   ├── item-artikel.html
│   ├── buku.html
│   ├── item-buku.html
│   ├── karya-ilmiah.html
│   ├── item-karya-ilmiah.html
│   └── user/
│       └── dashboard.html
├── script/
│   └── script.js
├── styles/
│   └── output.css
├── assets/
│   ├── icons/
│   └── images/
├── server/
│   ├── package.json
│   ├── .env
│   ├── prisma/
│   │   └── schema.prisma
│   └── src/
│       ├── index.js
│       ├── config/
│       │   ├── index.js
│       │   └── database.js
│       ├── controllers/
│       │   ├── authController.js
│       │   ├── articleController.js
│       │   ├── bookController.js
│       │   └── scientificController.js
│       ├── middlewares/
│       │   ├── auth.js
│       │   ├── upload.js
│       │   └── errorHandler.js
│       ├── routes/
│       │   ├── auth.js
│       │   ├── articles.js
│       │   ├── books.js
│       │   └── scientific.js
│       └── utils/
│           ├── AppError.js
│           └── response.js
├── uploads/
│   ├── article/
│   ├── book/
│   └── scientific/
├── .env.example
├── .gitignore
└── README.md
```

## Usage Flow

1. **Register** - Create a new account at `/pages/daftar.html`
2. **Login** - Login at `/pages/login.html`
3. **Dashboard** - Manage your content at `/pages/user/dashboard.html`
4. **Browse** - View articles, books, and scientific works on the main pages

## Security

- JWT authentication for protected routes
- Password hashing with bcryptjs
- Ownership validation (users can only modify their own content)
- Input validation on all endpoints
- File type validation (jpg, jpeg, png, pdf only)
- Centralized error handling
