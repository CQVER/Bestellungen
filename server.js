const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory storage (in production, you'd use a database)
let gameData = {
    people: [],
    foodItems: []
};

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API Routes

// Get all data
app.get('/api/data', (req, res) => {
    res.json(gameData);
});

// Update all data
app.post('/api/data', (req, res) => {
    gameData = req.body;
    res.json({ success: true });
});

// Add person
app.post('/api/people', (req, res) => {
    const { name } = req.body;
    if (name && !gameData.people.find(p => p.name === name)) {
        gameData.people.unshift({
            name: name,
            orders: {},
            completed: false
        });
        res.json({ success: true, data: gameData });
    } else {
        res.status(400).json({ error: 'Invalid name or person already exists' });
    }
});

// Add food
app.post('/api/food', (req, res) => {
    const { name, quantity } = req.body;
    if (name && quantity > 0) {
        const existingFood = gameData.foodItems.find(f => f.name === name);
        if (existingFood) {
            existingFood.quantity += quantity;
        } else {
            gameData.foodItems.push({
                name: name,
                quantity: quantity
            });
        }
        res.json({ success: true, data: gameData });
    } else {
        res.status(400).json({ error: 'Invalid food data' });
    }
});

// Delete food
app.delete('/api/food/:name', (req, res) => {
    const foodName = req.params.name;
    
    // Remove from all orders
    gameData.people.forEach(person => {
        if (person.orders[foodName]) {
            delete person.orders[foodName];
        }
    });
    
    // Remove from food list
    gameData.foodItems = gameData.foodItems.filter(food => food.name !== foodName);
    
    res.json({ success: true, data: gameData });
});

// Add food to person's order
app.post('/api/order', (req, res) => {
    const { personName, foodName } = req.body;
    const person = gameData.people.find(p => p.name === personName);
    const food = gameData.foodItems.find(f => f.name === foodName);
    
    if (person && food && food.quantity > 0) {
        // Add to person's order
        if (person.orders[foodName]) {
            person.orders[foodName]++;
        } else {
            person.orders[foodName] = 1;
        }
        
        // Decrease food quantity
        food.quantity--;
        
        res.json({ success: true, data: gameData });
    } else {
        res.status(400).json({ error: 'Invalid order data' });
    }
});

// Remove item from order
app.delete('/api/order', (req, res) => {
    const { personName, foodName } = req.body;
    const person = gameData.people.find(p => p.name === personName);
    const food = gameData.foodItems.find(f => f.name === foodName);
    
    if (person && person.orders[foodName] && food) {
        // Return one item to stock
        food.quantity++;
        
        // Remove from order
        person.orders[foodName]--;
        if (person.orders[foodName] === 0) {
            delete person.orders[foodName];
        }
        
        res.json({ success: true, data: gameData });
    } else {
        res.status(400).json({ error: 'Invalid order removal data' });
    }
});

// Toggle order completion
app.patch('/api/people/:name/complete', (req, res) => {
    const person = gameData.people.find(p => p.name === req.params.name);
    if (person) {
        person.completed = !person.completed;
        res.json({ success: true, data: gameData });
    } else {
        res.status(404).json({ error: 'Person not found' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});