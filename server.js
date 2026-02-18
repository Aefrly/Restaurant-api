// Import packages, initialize an express app, and define the port you will use
const express = require('express');
const app = express();
const port = 3000;
const { body, validationResult } = require('express-validator');

// Data for the server
const menuItems = [
  {
    id: 1,
    name: "Classic Burger",
    description: "Beef patty with lettuce, tomato, and cheese on a sesame seed bun",
    price: 12.99,
    category: "entree",
    ingredients: ["beef", "lettuce", "tomato", "cheese", "bun"],
    available: true
  },
  {
    id: 2,
    name: "Chicken Caesar Salad",
    description: "Grilled chicken breast over romaine lettuce with parmesan and croutons",
    price: 11.50,
    category: "entree",
    ingredients: ["chicken", "romaine lettuce", "parmesan cheese", "croutons", "caesar dressing"],
    available: true
  },
  {
    id: 3,
    name: "Mozzarella Sticks",
    description: "Crispy breaded mozzarella served with marinara sauce",
    price: 8.99,
    category: "appetizer",
    ingredients: ["mozzarella cheese", "breadcrumbs", "marinara sauce"],
    available: true
  },
  {
    id: 4,
    name: "Chocolate Lava Cake",
    description: "Warm chocolate cake with molten center, served with vanilla ice cream",
    price: 7.99,
    category: "dessert",
    ingredients: ["chocolate", "flour", "eggs", "butter", "vanilla ice cream"],
    available: true
  },
  {
    id: 5,
    name: "Fresh Lemonade",
    description: "House-made lemonade with fresh lemons and mint",
    price: 3.99,
    category: "beverage",
    ingredients: ["lemons", "sugar", "water", "mint"],
    available: true
  },
  {
    id: 6,
    name: "Fish and Chips",
    description: "Beer-battered cod with seasoned fries and coleslaw",
    price: 14.99,
    category: "entree",
    ingredients: ["cod", "beer batter", "potatoes", "coleslaw", "tartar sauce"],
    available: false
  }
];

// Define routes and implement middleware here
//Middleware
app.use(express.json());

// Custom middleware for logging requests
const requestLogger = (req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  
    // Log request body for POST and PUT requests
    if (req.method === 'POST' || req.method === 'PUT') {
         console.log('Request Body:',
   JSON.stringify(req.body, null, 2));
}
  
    next(); // Pass control to next middleware
};

// Custom logging middleware
app.use(requestLogger);

// Complete validation rules for todos
const menuValidation = [
  body('name')
    .isLength({ min: 3 })
    .withMessage('Name must be at least 3 characters long'),
  
  body('description')
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters long'),
  
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  
  body('category')
    .isIn(['appetizer', 'entree', 'dessert', 'beverage'])
    .withMessage('Category must be appetizer, entree, dessert, or beverage'),
  
  body('ingredients')
    .isArray({ min: 1 })
    .withMessage('Ingredients must be an array with at least one ingredient'),
  
  body('available')
    .optional()
    .isBoolean()
    .withMessage('Available must be true or false')
];

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
  
    if (!errors.isEmpty()) {
        const errorMessages =
    errors.array().map(error => error.msg);
    
        return res.status(400).json({
            error: 'Validation failed',
            messages: errorMessages
        });
    }
  
    // Set default value for available if not provided
    if (req.body.available === undefined) {
        req.body.available = true;
    }
  
    next();
};

//Routes
app.get('/api/menu', (req, res) => {
    res.json(menuItems);
});

app.get('/api/menu/:id', (req, res) => {
    const menuid = parseInt(req.params.id);
    const menu = menuItems.find(item => item.id === menuid);

    if (menu) {
        res.json(menu);
    } else {
        res.status(404).json({ error: 'Menu item not found' });
    }
});

app.post('/api/menu', menuValidation, handleValidationErrors, (req, res) => {
    const { name, description, price, category, ingredients, available } = req.body;

    const newMenuItem = {
        id: menuItems.length + 1,
        name,
        description,
        price,
        category,
        ingredients,
        available
    };

    menuItems.push(newMenuItem);
    res.status(201).json(newMenuItem);
});

app.put('/api/menu/:id', menuValidation, handleValidationErrors, (req, res) => {
    const menuId = parseInt(req.params.id);
    const { name, description, price, category, ingredients, available } = req.body;

    const menuIndex = menuItems.findIndex(item => item.id === menuId);

    if (menuIndex === -1) {
        return res.status(404).json({ error: 'Menu item not found' });
    }

    menuItems[menuIndex] = {
        id: menuId,
        name,
        description,
        price,
        category,
        ingredients,
        available
    };

    res.json(menuItems[menuIndex]);
});

app.delete('/api/menu/:id', (req, res) => {
    const menuId = parseInt(req.params.id);
    const menuIndex = menuItems.findIndex(item => item.id === menuId);

    if (menuIndex === -1) {
        return res.status(404).json({ error: 'Menu item not found' });
    }

    const deletedMenuItem = menuItems.splice(menuIndex, 1)[0];
    res.json({ message: 'Menu item deleted successfully', deletedItem: deletedMenuItem });
});

app.listen(port, () => {
    console.log(`Menu API is running on http://localhost:${port}`);
});