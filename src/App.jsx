import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:5000/api";

function App() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    category: "",
    price: "",
    stock: "",
    isbn: "",
  });

  // Fetch all books
  const fetchBooks = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/books`);

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch books");
      }

      setBooks(result.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  // Input change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Add or Update book
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const url = editId
        ? `${API_URL}/books/${editId}`
        : `${API_URL}/books`;

      const method = editId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price),
          stock: Number(formData.stock),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Operation failed");
      }

      alert(
        editId
          ? "Book updated successfully!"
          : "Book added successfully!"
      );

      setShowForm(false);
      setEditId(null);

      setFormData({
        title: "",
        author: "",
        category: "",
        price: "",
        stock: "",
        isbn: "",
      });

      fetchBooks();
    } catch (err) {
      alert(err.message);
    }
  };

  // Edit book
  const handleEdit = (book) => {
    setEditId(book._id || book.id);

    setFormData({
      title: book.title || "",
      author: book.author || "",
      category: book.category || "",
      price: book.price || "",
      stock: book.stock || "",
      isbn: book.isbn || "",
    });

    setShowForm(true);
  };

  // Delete book
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this book?"
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(`${API_URL}/books/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Delete failed");
      }

      alert("Book deleted successfully!");

      fetchBooks();
    } catch (err) {
      alert(err.message);
    }
  };

  // Search books
  const filteredBooks = books.filter((book) =>
    `${book.title} ${book.author} ${book.category}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // Dashboard calculations
  const totalBooks = books.length;

  const totalStock = books.reduce(
    (total, book) => total + Number(book.stock || 0),
    0
  );

  const inventoryValue = books.reduce(
    (total, book) =>
      total +
      Number(book.price || 0) *
        Number(book.stock || 0),
    0
  );

  return (
    <div className="app">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2>📚 BookStore</h2>

        <nav>
          <a href="#dashboard" className="active">
            Dashboard
          </a>

          <a href="#inventory">
            Book Inventory
          </a>
        </nav>

        <button className="logout">
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="header">
          <div>
            <h1>Bookstore Dashboard</h1>
            <p>Manage your books and inventory</p>
          </div>

          <button
            className="add-button"
            onClick={() => {
              setEditId(null);

              setFormData({
                title: "",
                author: "",
                category: "",
                price: "",
                stock: "",
                isbn: "",
              });

              setShowForm(true);
            }}
          >
            + Add New Book
          </button>
        </header>

        {/* Dashboard Cards */}
        <section className="dashboard-cards" id="dashboard">
          <div className="card">
            <p>Total Books</p>
            <h2>{totalBooks}</h2>
          </div>

          <div className="card">
            <p>Total Stock</p>
            <h2>{totalStock}</h2>
          </div>

          <div className="card">
            <p>Inventory Value</p>
            <h2>
              ₹{inventoryValue.toLocaleString("en-IN")}
            </h2>
          </div>
        </section>

        {/* Book Inventory */}
        <section className="inventory" id="inventory">
          <div className="inventory-header">
            <h2>Book Inventory</h2>

            <input
              type="text"
              placeholder="Search books..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {loading && <p>Loading books...</p>}

          {error && (
            <p className="error">
              {error}
            </p>
          )}

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Book Title</th>
                  <th>Author</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredBooks.map((book) => (
                  <tr key={book._id || book.id}>
                    <td>{book.title}</td>

                    <td>{book.author}</td>

                    <td>
                      <span className="category">
                        {book.category}
                      </span>
                    </td>

                    <td>₹{book.price}</td>

                    <td>{book.stock}</td>

                    <td>
                      <button
                        className="edit-button"
                        onClick={() => handleEdit(book)}
                      >
                        Edit
                      </button>

                      <button
                        className="delete-button"
                        onClick={() =>
                          handleDelete(book._id || book.id)
                        }
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}

                {!loading && filteredBooks.length === 0 && (
                  <tr>
                    <td colSpan="6">
                      No books found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* Add / Edit Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>
              {editId ? "Edit Book" : "Add New Book"}
            </h2>

            <form onSubmit={handleSubmit}>
              <input
                name="title"
                placeholder="Book Title"
                value={formData.title}
                onChange={handleChange}
                required
              />

              <input
                name="author"
                placeholder="Author"
                value={formData.author}
                onChange={handleChange}
                required
              />

              <input
                name="category"
                placeholder="Category"
                value={formData.category}
                onChange={handleChange}
                required
              />

              <input
                name="price"
                type="number"
                min="0"
                placeholder="Price"
                value={formData.price}
                onChange={handleChange}
                required
              />

              <input
                name="stock"
                type="number"
                min="0"
                placeholder="Stock"
                value={formData.stock}
                onChange={handleChange}
                required
              />

              <input
                name="isbn"
                placeholder="ISBN"
                value={formData.isbn}
                onChange={handleChange}
              />

              <div className="modal-actions">
                <button type="submit">
                  {editId ? "Update Book" : "Add Book"}
                </button>

                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;