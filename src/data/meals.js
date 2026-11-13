export const MEALS = [
  {
    id: 'standard',
    name: 'Standard Meal',
    price: 0,
    description: 'Chef’s daily pick: paneer tikka, jeera rice, seasonal salad and a sweet finish.',
    tag: 'Included',
  },
  {
    id: 'veg',
    name: 'Vegetarian Meal',
    price: 150,
    description: 'Hyderabadi vegetable dum biryani with mint raita, roasted papad and gulab jamun.',
    tag: 'Veg',
  },
  {
    id: 'nonveg',
    name: 'Non-Vegetarian Meal',
    price: 200,
    description: 'Butter chicken with saffron pulao, garlic naan, kachumber salad and kheer.',
    tag: 'Non-veg',
  },
  {
    id: 'premium',
    name: 'Premium Meal',
    price: 300,
    description: 'Three-course chef’s selection: starter, signature main, artisanal dessert and a beverage.',
    tag: 'Chef’s pick',
  },
  {
    id: 'none',
    name: 'No Meal',
    price: 0,
    description: 'Skip the meal. Complimentary water and a light snack are still on us.',
    tag: 'Skip',
  },
]

export const MEALS_BY_ID = Object.fromEntries(MEALS.map((meal) => [meal.id, meal]))
