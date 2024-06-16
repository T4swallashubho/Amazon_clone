import express from 'express';
import Product from '../models/Product.js';
import expressAsyncHandler from 'express-async-handler';
import { isAdmin, isAuth, isSellerOrAdmin } from '../utils.js';
const productsRoutes = express.Router();

productsRoutes.get('/', async (req, res) => {
  // filter products only those that seller owns and operates.

  const seller = req.query.seller || '';
  const searchFilter = seller ? { seller } : {};
  const { page } = req.query;
  const pageSize = 2;
  const products = await Product.find({ ...searchFilter }).populate(
    'seller',
    'seller.name seller.logo'
  );

  if (page) {
    const products = await Product.find({ ...searchFilter })
      .populate('seller', 'seller.name seller.logo')
      .skip(pageSize * (page - 1))
      .limit(pageSize);

    const countProducts = await Product.countDocuments({
      ...searchFilter,
    });

    return res.send({
      products,
      page,
      pages: Math.ceil(countProducts / pageSize),
    });
  }

  if (products) {
    res.send({ products });
  } else {
    res.status(404).send({
      message: 'No Products to display',
    });
  }
});

productsRoutes.put(
  '/:id',
  isAuth,
  isSellerOrAdmin,
  expressAsyncHandler(async (req, res) => {
    const id = req.params.id;
    const {
      name,
      slug,
      category,
      image,
      images,
      price,
      countInStock,
      brand,
      rating,
      numReviews,
      description,
    } = req.body;

    const checkProduct = await Product.findById(id);

    if (checkProduct) {
      checkProduct.name = name;
      checkProduct.slug = slug;
      checkProduct.category = category;
      checkProduct.image = image;
      checkProduct.images = images;
      checkProduct.price = price;
      checkProduct.countInStock = countInStock;
      checkProduct.brand = brand;
      checkProduct.rating = rating;
      checkProduct.numReviews = numReviews;
      checkProduct.description = description;

      await checkProduct.save();
      res.send({
        message: 'Product updated successfully',
      });
    } else {
      res.send({
        message: 'Product not found',
      });
    }
  })
);

productsRoutes.delete(
  '/:id',
  isAuth,
  isSellerOrAdmin,
  expressAsyncHandler(async (req, res) => {
    const id = req.params.id;
    const product = await Product.findById(id);

    if (product) {
      await product.remove();
      res.send({ message: 'Product deleted successfully' });
    } else {
      res.status(404).send({ message: 'Product not found' });
    }
  })
);

productsRoutes.get(
  '/top-sales-brand',
  expressAsyncHandler(async (req, res) => {
    //top brand names based on rating
    const productByBrand = await Product.aggregate([
      { $group: { _id: '$brand', avgrating: { $avg: { $sum: '$rating' } } } },
    ])
      .sort({ avgrating: -1 })
      .limit(3);


      console.log(productByBrand)

    res.send(productByBrand);
  })
);

productsRoutes.post(
  '/',
  isAuth,
  isSellerOrAdmin,
  expressAsyncHandler(async (req, res) => {
    const newProduct = await Product.create({
      name: 'sample name ' + Date.now(),
      seller: req.user._id,
      slug: 'sample-slug- ' + Date.now(),
      category: 'Unknown',
      image: '/images/p2.jpg',
      price: 0,
      countInStock: 0,
      brand: 'Unknown',
      rating: 0,
      numReviews: 0,
      description: 'Sample Description',
    });

    const product = await newProduct.save();

    res.send({
      message: 'Product Created successfully',
      product,
    });
  })
);

productsRoutes.get(
  '/categories',
  expressAsyncHandler(async (req, res) => {
    const categories = await Product.find().distinct('category');
    res.send(categories);
  })
);

productsRoutes.get(
  '/search',
  expressAsyncHandler(async (req, res) => {
    const PAGE_SIZE = 3;

    const { query } = req;

    const pageSize = query.pageSize || PAGE_SIZE;
    const page = query.page || 1;
    const category = query.category || '';
    const price = query.price || '';
    const searchQuery = query.query || '';
    const order = query.order || '';
    const rating = query.rating || '';

    // filter starting.
    const queryFilters =
      searchQuery && searchQuery !== 'all'
        ? {
            name: {
              $regex: searchQuery,
              $options: 'i',
            },
          }
        : {};

    const categoryFilter =
      category && category !== 'all'
        ? {
            category,
          }
        : {};

    const priceFilter =
      price && price !== 'all'
        ? {
            price: {
              $gte: Number(price.split('-')[0]),
              $lte: Number(price.split('-')[1]),
            },
          }
        : {};

    const ratingFilter =
      rating && rating !== 'all'
        ? {
            rating: {
              $gte: Number(rating),
            },
          }
        : {};

    const sortOrder =
      order === 'featured'
        ? {
            featured: -1,
          }
        : order === 'toprated'
        ? {
            rating: -1,
          }
        : order === 'highest'
        ? {
            price: -1,
          }
        : order === 'lowest'
        ? {
            price: 1,
          }
        : order === 'newest'
        ? {
            createdAt: -1,
          }
        : {
            _id: -1,
          };

    // filter end

    // methods to execute.

    const products = await Product.find({
      ...queryFilters,
      ...priceFilter,
      ...categoryFilter,
      ...ratingFilter,
    })
      .sort(sortOrder)
      .skip(pageSize * (page - 1))
      .limit(pageSize);

    const countProducts = await Product.countDocuments({
      ...queryFilters,
      ...priceFilter,
      ...categoryFilter,
      ...ratingFilter,
    });

    res.send({
      products,
      countProducts,
      page,
      pages: Math.ceil(countProducts / pageSize),
    });
  })
);

productsRoutes.get(
  '/admin',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const { query } = req;
    const pageSize = 3;
    const page = query.page || 1;

    const products = await Product.find()
      .skip(pageSize * (page - 1))
      .limit(pageSize);

    const countProducts = await Product.countDocuments();

    res.send({
      products,
      page,
      pages: Math.ceil(countProducts / pageSize),
    });
  })
);

productsRoutes.get('/slug/:slug', async (req, res) => {
  const product = await Product.findOne({
    slug: req.params.slug,
  }).populate(
    'seller',
    'seller.name seller.logo seller.rating seller.numReviews'
  );

  if (product) {
    res.send(product);
  } else {
    res.status(404).send({
      message: 'Oops!! Product Not Found',
    });
  }
});

productsRoutes.get('/:id', async (req, res) => {
  const product = await Product.findById(req.params.id).populate(
    'seller',
    'seller.name seller.logo seller.rating seller.numReviews'
  );

  if (product) {
    res.send(product);
  } else {
    res.status(404).send({
      message: 'Oops!! Product Not Found',
    });
  }
});

productsRoutes.post(
  '/:id/reviews',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const productId = req.params.id;

    const { comment, rating } = req.body;

    const product = await Product.findById(productId);

    if (product) {
      if (product.reviews.find((x) => x.name === req.user.name)) {
        return res
          .status(400)
          .send({ message: 'You already submitted a review' });
      }

      const review = {
        name: req.user.name,
        rating: Number(rating),
        comment,
      };

      product.reviews.push(review);

      product.numReviews = product.reviews.length;

      product.rating =
        product.reviews.reduce((a, c) => c.rating + a, 0) /
        product.reviews.length;

      const updatedProduct = await product.save();

      res.status(201).send({
        message: 'Review created',
        rating: product.rating,
        numReviews: product.numReviews,
        review: updatedProduct.reviews[updatedProduct.reviews.length - 1],
      });
    } else {
      res.status(404).send({ message: 'Product Not Found' });
    }
  })
);

export default productsRoutes;
