import express from 'express';

const router = express.Router();

const categories = [
  { id: 'kitchen', name: 'Kitchen', icon: 'utensils', subcategories: ['Cookware', 'Bakeware', 'Kitchen Tools', 'Appliances'] },
  { id: 'dining', name: 'Dining', icon: 'utensils', subcategories: ['Dinnerware', 'Glassware', 'Table Linens', 'Serveware'] },
  { id: 'accessories', name: 'Accessories', icon: 'sparkles', subcategories: ['Jewelry', 'Bags', 'Watches', 'Sunglasses'] },
  { id: 'storage', name: 'Storage', icon: 'archive', subcategories: ['Containers', 'Organizers', 'Baskets', 'Shelving'] },
  { id: 'essentials', name: 'Essentials', icon: 'star', subcategories: ['Daily Needs', 'Personal Care', 'Health', 'Cleaning'] },
  { id: 'electronics', name: 'Electronics', icon: 'device-phone-mobile', subcategories: ['Phones', 'Laptops', 'Accessories', 'Smart Home'] },
  { id: 'fashion', name: 'Fashion', icon: 'shopping-bag', subcategories: ['Men', 'Women', 'Kids', 'Shoes'] },
  { id: 'home-decor', name: 'Home Decor', icon: 'home', subcategories: ['Wall Art', 'Lighting', 'Furniture', 'Rugs'] },
  { id: 'gifts', name: 'Gifts', icon: 'gift', subcategories: ['Personalized', 'Occasions', 'Corporate', 'Cards'] },
];

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
router.get('/', (req, res) => {
  res.json({
    success: true,
    count: categories.length,
    data: categories,
  });
});

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
router.get('/:id', (req, res, next) => {
  const category = categories.find(c => c.id === req.params.id);
  
  if (!category) {
    const error = new Error('Category not found');
    error.status = 404;
    return next(error);
  }

  res.json({
    success: true,
    data: category,
  });
});

export default router;
