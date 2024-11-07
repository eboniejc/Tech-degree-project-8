const express = require("express");
const router = express.Router();
const Book = require("../models").Book;
const { Op } = require("sequelize");

// Handler for async routes
function asyncHandler(cb) {
  return async (req, res, next) => {
    try {
      await cb(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}

/* GET all books with Exceeds search  */
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { search } = req.query;
    const limit = 5; // Number of books per page
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;

    let whereCondition = {};
    if (search) {
      whereCondition = {
        [Op.or]: [
          { title: { [Op.like]: `%${search}%` } },
          { author: { [Op.like]: `%${search}%` } },
          { genre: { [Op.like]: `%${search}%` } },
          { year: { [Op.like]: `%${search}%` } },
        ],
      };
    }

    const { count, rows: books } = await Book.findAndCountAll({
      where: whereCondition,
      limit,
      offset,
    });

    const totalPages = Math.ceil(count / limit);

    res.render("books/index", {
      title: "Books",
      books,
      search,
      page,
      totalPages,
    });
  }),
);

/* Create a new book form. */
router.get("/new", (req, res) => {
  res.render("form", { book: {}, title: "New Book", isEditing: false });
});

/* POST create Book. */
router.post(
  "/",
  asyncHandler(async (req, res) => {
    let book;
    try {
      book = await Book.create(req.body);
      res.redirect("/books/"); // Redirect to books page
    } catch (error) {
      if (error.name === "SequelizeValidationError") {
        const errors = error.errors.map((err) => err.message);
        res.render("form", {
          book: req.body,
          errors,
          title: "New Book",
          isEditing: false,
        });
      } else {
        throw error;
      }
    }
  }),
);

/* Edit book form. */
router.get(
  "/:id/edit",
  asyncHandler(async (req, res) => {
    const book = await Book.findByPk(req.params.id);
    if (book) {
      res.render("form", { book, title: "Edit Book", isEditing: true });
    } else {
      res.sendStatus(404);
    }
  }),
);

/* GET individual Book. */
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const book = await Book.findByPk(req.params.id);
    if (book) {
      res.render("books/show", { book, title: book.title });
    } else {
      res.sendStatus(404);
    }
  }),
);

/* Update a Book. */
router.post(
  "/:id/edit",
  asyncHandler(async (req, res) => {
    let book;
    try {
      book = await Book.findByPk(req.params.id);
      if (book) {
        await book.update(req.body);
        res.redirect("/books"); // Redirect to books listing page after successful update
      } else {
        res.sendStatus(404);
      }
    } catch (error) {
      if (error.name === "SequelizeValidationError") {
        const errors = error.errors.map((err) => err.message);
        res.render("form", {
          book: { ...req.body, id: req.params.id },
          errors,
          title: "Edit Book",
          isEditing: true,
        });
      } else {
        throw error;
      }
    }
  }),
);

/* Delete book form. */
router.get(
  "/:id/delete",
  asyncHandler(async (req, res) => {
    const book = await Book.findByPk(req.params.id);
    if (book) {
      res.render("books/delete", { book, title: "Delete Book" });
    } else {
      res.sendStatus(404);
    }
  }),
);

/* Delete individual Book. */
router.post(
  "/:id/delete",
  asyncHandler(async (req, res) => {
    const book = await Book.findByPk(req.params.id);
    if (book) {
      await book.destroy();
      res.redirect("/books");
    } else {
      res.sendStatus(404);
    }
  }),
);

module.exports = router;
