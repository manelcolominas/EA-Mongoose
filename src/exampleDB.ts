import mongoose, { Types } from 'mongoose';
import { CustomerModel } from './customer.js';
import { RestaurantModel } from './restaurant.js';
import { StatisticsModel } from './statistics.js';
import { RewardModel } from './reward.js';
import { ReviewModel } from './review.js';
import { BadgeModel } from "./badge.js";
import { VisitModel } from "./visit.js";

// ANSI color codes for terminal output
const C = {
  reset:   '\x1b[0m',
  key:     '\x1b[36m',   // cyan      → keys
  string:  '\x1b[32m',   // green     → string values
  number:  '\x1b[33m',   // yellow    → numbers
  boolean: '\x1b[35m',   // magenta   → booleans
  null:    '\x1b[31m',   // red       → null
  bracket: '\x1b[90m',   // dark grey → braces / brackets
  header:  '\x1b[1m\x1b[34m', // bold blue → section headers
};

function colorJson(obj: unknown, indent = 0): string {
  const pad = ' '.repeat(indent);
  const padIn = ' '.repeat(indent + 2);

  if (obj === null)            return `${C.null}null${C.reset}`;
  if (typeof obj === 'boolean') return `${C.boolean}${obj}${C.reset}`;
  if (typeof obj === 'number')  return `${C.number}${obj}${C.reset}`;
  if (typeof obj === 'string')  return `${C.string}"${obj}"${C.reset}`;

  if (Array.isArray(obj)) {
    if (obj.length === 0) return `${C.bracket}[]${C.reset}`;
    const items = obj.map(v => `${padIn}${colorJson(v, indent + 2)}`).join(',\n');
    return `${C.bracket}[${C.reset}\n${items}\n${pad}${C.bracket}]${C.reset}`;
  }

  if (typeof obj === 'object') {
    const entries = Object.entries(obj as Record<string, unknown>);
    if (entries.length === 0) return `${C.bracket}{}${C.reset}`;
    const lines = entries.map(([k, v]) =>
        `${padIn}${C.key}"${k}"${C.reset}: ${colorJson(v, indent + 2)}`
    ).join(',\n');
    return `${C.bracket}{${C.reset}\n${lines}\n${pad}${C.bracket}}${C.reset}`;
  }

  return String(obj);
}

function printSection(title: string, data: unknown) {
  console.log(`\n${C.header}══════════════════════════════${C.reset}`);
  console.log(`${C.header}  ${title}${C.reset}`);
  console.log(`${C.header}══════════════════════════════${C.reset}`);
  console.log(colorJson(data));
}

/*🛠️ Requisits Tècnics
Una nova col·lecció enllaçada
CRUD de la nova col·lecció:
    create: Guarda.
    getById(id): Retorna amb el seu populate de la col·lecció enllaçada.
    update(id, data): Modifica les dades.
    delete(id): Elimina.
    listAll(): Llista tots els documents usant .lean().*/

async function runDemoSeminari() {
  try {

    await mongoose.connect('mongodb://127.0.0.1:27017/example_database');
    console.log('Connected to MongoDB');

    console.log('Cleaning database...');
    await CustomerModel.deleteMany({});
    await RestaurantModel.deleteMany({});
    await RewardModel.deleteMany({});
    await StatisticsModel.deleteMany({});
    await ReviewModel.deleteMany({});
    await VisitModel.deleteMany({});
    await BadgeModel.deleteMany({});

    // 1️⃣ Insert badges (no dependencies)
    const badges = await BadgeModel.insertMany([
      {
        title: "Explorador Gastronòmic",
        description: "Visitar 5 restaurants diferents dins de l'aplicació",
        type: "client"
      },
      {
        title: "Crític Actiu",
        description: "Escriure 10 valoracions de restaurants",
        type: "client"
      },
      {
        title: "Excel·lent Tracte al Client",
        description: "Obtenir una valoració mitjana superior a 4.5 en el servei",
        type: "restaurant"
      },
      {
        title: "Restaurant Generós",
        description: "Donar més punts de fidelització que la mitjana de restaurants de la zona",
        type: "restaurant"
      }
    ]);

    // 2️⃣ Insert restaurant (bare, without rewards/statistics yet)
    let restaurants = await RestaurantModel.insertMany([
      {
        profile: {
          name: "La Pasta Bella",
          description: "Restaurant italià amb receptes tradicionals i ingredients frescos.",
          rating: 4.65,
          category: "Italià",
          timetable: ["12:00-15:30", "19:00-23:00"],
          image: [
            "https://app-images/la_pasta_bella_front.jpg",
            "https://app-images/la_pasta_bella_dining.jpg"
          ],
          contact: {
            phone: "+34 600000000",
            email: "info@lapastabella.com"
          },
          location: {
            city: "Barcelona",
            address: "Carrer de Mallorca 120",
            coordinates: {
              type: "Point",
              coordinates: [2.1734, 41.3851]
            }
          }
        },
        badges: [
          badges[0]._id,
          badges[1]._id,
          badges[2]._id
        ]
      }
    ]);

    // 3️⃣ Insert rewards (needs restaurant)
    const rewards = await RewardModel.insertMany([
      {
        restaurant_id: restaurants[0]._id,
        name: "Postre gratuït",
        description: "Gaudeix d'un postre al final del teu menjar",
        pointsRequired: 20,
        expiry: "2026-12-31",
        timesRedeemed: 150
      }
    ]);

    // 4️⃣ Insert statistics (needs restaurant + rewards)
    const statistics = await StatisticsModel.insertMany([
      {
        restaurant_id: restaurants[0]._id,
        totalPointsGiven: 1250,
        loyalCustomers: 85,
        mostRequestedRewards: [
          rewards[0]._id
        ],
        averagePointsPerVisit: 8
      }
    ]);

    // 5️⃣ Update restaurant with rewards + statistics refs
    restaurants[0].rewards = rewards.map(r => new Types.ObjectId(r._id));
    restaurants[0].statistics = new Types.ObjectId(statistics[0]._id);
    await restaurants[0].save();

    // 6️⃣ Insert customers (bare, without visitHistory/reviews yet)
    const customers = await CustomerModel.insertMany([
      {
        name: "Clara Martínez",
        email: "clara.martinez@example.com",
        passwordHash: "$2b$10$abcdef1234567890abcdef1234567890abcdef1234567890",
        profilePictures: ["https://app-images/users/clara.jpg"],
        pointsWallet: [
          {
            restaurant_id: restaurants[0]._id,
            points: 120
          }
        ],
        favoriteRestaurants: [restaurants[0]._id],
        badges: [badges[0]._id]
      }
    ]);

    // 7️⃣ Insert visits (needs customers + restaurants)
    const visits = await VisitModel.insertMany([
      {
        customer_id: customers[0]._id,
        restaurant_id: restaurants[0]._id,
        date: "2026-03-05T20:00:00Z",
        pointsEarned: 10,
        billAmount: 25.50
      }
    ]);

    // 8️⃣ Insert reviews (needs customers + restaurants)
    const reviews = await ReviewModel.insertMany([
      {
        customer_id: customers[0]._id,
        restaurant_id: restaurants[0]._id,
        date: "2026-03-05T20:15:00Z",
        ratings: {
          foodQuality: 5,
          staffService: 4,
          cleanliness: 5,
          environment: 4
        },
        comment: "El menjar estava excel·lent i el personal molt amable. Tornaré segur!",
        photos: [
          "https://app-images/food1.jpg",
          "https://app-images/table1.jpg"
        ],
        likes: 3,
        extraPoints: 5
      },
      {
        customer_id: customers[0]._id,
        restaurant_id: restaurants[0]._id,
        date: "2026-03-06T13:10:00Z",
        ratings: {
          foodQuality: 4,
          staffService: 5,
          cleanliness: 4,
          environment: 4
        },
        likes: 3,
        extraPoints: 1
      }
    ]);

    // 9️⃣ Update customer with visitHistory + reviews refs
    await CustomerModel.findByIdAndUpdate(customers[0]._id, {
      $set: {
        visitHistory: [visits[0]._id],
        reviews: reviews.map(r => new Types.ObjectId(r._id))
      }
    });

    console.log("\nCREATE");
    console.log(`Seeded ${customers.length} clients and ${restaurants.length} restaurants`);

    // ============================================================
    // --- GET BY ID (populated — essential fields only) ---
    // ============================================================

    // 👤 Customer
    const fullCustomer = await CustomerModel.findById(customers[0]._id)
        .populate('favoriteRestaurants',        'profile.name profile.rating profile.category')
        .populate('reviews',                    'ratings comment')
        .populate('pointsWallet.restaurant_id', 'profile.name profile.rating profile.category')
        .lean();

    printSection("GET BY ID — Customer 👤", fullCustomer);

    // 🍽️ Restaurant
    const fullRestaurant = await RestaurantModel.findById(restaurants[0]._id)
        .populate('rewards',   'name pointsRequired')
        .populate('statistics','totalPointsGiven averagePointsPerVisit')
        .lean();

    printSection("GET BY ID — Restaurant 🍽️", fullRestaurant);

    // 🎁 Reward
    const fullReward = await RewardModel.findById(rewards[0]._id)
        .populate('restaurant_id', 'profile.name profile.rating profile.category')
        .lean();

    printSection("GET BY ID — Reward 🎁", fullReward);

    // 📊 Statistics
    const fullStatistics = await StatisticsModel.findById(statistics[0]._id)
        .populate('restaurant_id',        'profile.name profile.rating profile.category')
        .populate('mostRequestedRewards', 'name pointsRequired')
        .lean();

    printSection("GET BY ID — Statistics 📊", fullStatistics);

    // 📝 Review
    const fullReview = await ReviewModel.findById(reviews[0]._id)
        .populate('customer_id',   'name email')
        .populate('restaurant_id', 'profile.name profile.rating profile.category')
        .lean();

    printSection("GET BY ID — Review 📝", fullReview);

    // 📅 Visit
    const fullVisit = await VisitModel.findById(visits[0]._id)
        .populate('customer_id',   'name email')
        .populate('restaurant_id', 'profile.name profile.rating profile.category')
        .lean();

    printSection("GET BY ID — Visit 📅", fullVisit);

    // ============================================================
    // --- UPDATE ---
    // ============================================================
    await CustomerModel.findByIdAndUpdate(customers[0]._id, {
      $push: { badges: badges[1]._id }
    });

    const updatedClient = await CustomerModel.findById(customers[0]._id)
        .populate('favoriteRestaurants',        'profile.name profile.rating profile.category')
        .populate('reviews',                    'ratings comment')
        .populate('pointsWallet.restaurant_id', 'profile.name profile.rating profile.category')
        .lean();
    printSection("UPDATE — Customer 🏅", updatedClient);

    // --- DELETE ---
    // await CustomerModel.findByIdAndDelete(customers[0]._id);
    // console.log("\nDELETE");
    // console.log("Client deleted");

    // ============================================================
    // --- LIST ALL (populated — essential fields only) ---
    // ============================================================

    const allCustomers = await CustomerModel.find()
        .populate('favoriteRestaurants',        'profile.name profile.rating profile.category')
        .populate('reviews',                    'ratings comment')
        .populate('pointsWallet.restaurant_id', 'profile.name profile.rating profile.category')
        .lean();
    printSection("LIST ALL — Customers 👤", allCustomers);

    const allRestaurants = await RestaurantModel.find()
        .populate('rewards',   'name pointsRequired')
        .populate('statistics','totalPointsGiven averagePointsPerVisit')
        .lean();
    printSection("LIST ALL — Restaurants 🍽️", allRestaurants);

    const allReviews = await ReviewModel.find()
        .populate('customer_id',   'name email')
        .populate('restaurant_id', 'profile.name profile.rating profile.category')
        .lean();
    printSection("LIST ALL — Reviews 📝", allReviews);

    const allVisits = await VisitModel.find()
        .populate('customer_id',   'name email')
        .populate('restaurant_id', 'profile.name profile.rating profile.category')
        .lean();
    printSection("LIST ALL — Visits 📅", allVisits);

    const allStatistics = await StatisticsModel.find()
        .populate('restaurant_id',        'profile.name profile.rating profile.category')
        .populate('mostRequestedRewards', 'name pointsRequired')
        .lean();
    printSection("LIST ALL — Statistics 📊", allStatistics);

    const allRewards = await RewardModel.find()
        .populate('restaurant_id', 'profile.name profile.rating profile.category')
        .lean();
    printSection("LIST ALL — Rewards 🎁", allRewards);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected');
  }
}

runDemoSeminari();