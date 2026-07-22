// seed.js
// A simple Node.js script to automate adding mock products via your API
// Make sure your Next.js dev server is running (npm run dev) on port 3000 before running this!

const API_URL = "http://localhost:3000/api/products";

const productsToSeed = [
  // --- ELECTRONICS (5 products) ---
  {
    name: "Noise-Canceling Wireless Headphones",
    description: "Experience premium sound quality with active noise cancellation and 30-hour battery life. Perfect for travel or focused work sessions.",
    price: 249.99,
    category: "Electronics",
    stock: 45,
    imageUrl: "https://res.cloudinary.com/ujkr9vct/image/upload/v1784709433/Wireless_Noise-Canceling_Earbuds_jw9exp.jpg",
    isFeatured: true
  },
  {
    name: "Ultra-Slim 4K Monitor",
    description: "27-inch 4K UHD display with vivid colors, thin bezels, and blue-light filter. Essential for designers, gamers, and productivity.",
    price: 399.00,
    category: "Electronics",
    stock: 12,
    imageUrl: "https://res.cloudinary.com/ujkr9vct/image/upload/v1784709434/Ultra-Slim_4K_Monitor_kreviu.webp",
    isFeatured: false
  },
  {
    name: "Mechanical Gaming Keyboard",
    description: "RGB backlit mechanical keyboard with tactile blue switches for the ultimate typing and gaming experience.",
    price: 129.50,
    category: "Electronics",
    stock: 0,
    imageUrl: "https://res.cloudinary.com/ujkr9vct/image/upload/v1784709433/Mechanical_Gaming_Keyboard_qtchsh.jpg",
    isFeatured: false
  },
  {
    name: "Ergonomic Wireless Mouse",
    description: "Precision wireless mouse with customizable buttons and an ergonomic design to reduce wrist strain during long hours.",
    price: 59.99,
    category: "Electronics",
    stock: 85,
    imageUrl: "https://res.cloudinary.com/ujkr9vct/image/upload/v1784709432/Ergonomic_Wireless_Mouse_dmqtec.jpg",
    isFeatured: false
  },
  {
    name: "10000mAh Fast-Charge Power Bank",
    description: "Compact and powerful portable charger. Supports 20W fast charging and can charge two devices simultaneously.",
    price: 34.99,
    category: "Electronics",
    stock: 150,
    imageUrl: "https://res.cloudinary.com/ujkr9vct/image/upload/v1784709433/10000mAh_Fast-Charge_Power_Bank_hkrw8i.jpg",
    isFeatured: false
  },

  // --- CLOTHING (5 products) ---
  {
    name: "Classic Denim Jacket",
    description: "Timeless styling meets modern comfort in this durable, everyday denim jacket. Features button closures and dual chest pockets.",
    price: 89.99,
    category: "Clothing",
    stock: 80,
    imageUrl: "https://res.cloudinary.com/ujkr9vct/image/upload/v1784709432/Classic_Denim_Jacket_dggk9q.jpg",
    isFeatured: true
  },
  // --- HOME (5 products) ---
  {
    name: "Ceramic Coffee Mug Set",
    description: "Set of 4 handcrafted ceramic mugs with a matte finish. Perfect for your morning brew or evening tea.",
    price: 34.00,
    category: "Home",
    stock: 25,
    imageUrl: "https://res.cloudinary.com/ujkr9vct/image/upload/v1784709432/Ceramic_Coffee_Mug_Set_rawyff.jpg",
    isFeatured: false
  },
  {
    name: "Aromatherapy Essential Oil Diffuser",
    description: "Ultrasonic diffuser with 7 ambient LED light settings and automatic shutoff. Creates a calming environment in any room.",
    price: 45.99,
    category: "Home",
    stock: 60,
    imageUrl: "https://res.cloudinary.com/ujkr9vct/image/upload/v1784709432/Aromatherapy_Essential_Oil_Diffuser_sgtsfr.jpg",
    isFeatured: true
  },
  {
    name: "Luxury Egyptian Cotton Bath Towels",
    description: "Set of 2 ultra-plush, highly absorbent bath towels made from 100% long-staple Egyptian cotton.",
    price: 59.50,
    category: "Home",
    stock: 40,
    imageUrl: "https://res.cloudinary.com/ujkr9vct/image/upload/v1784709433/Luxury_Egyptian_Cotton_Bath_Towels_ipaxgg.jpg",
    isFeatured: false
  },
  {
    name: "Pre-Seasoned Cast Iron Skillet",
    description: "10-inch heavy-duty cast iron skillet. Perfect for searing, baking, and lifelong durability in the kitchen.",
    price: 29.99,
    category: "Home",
    stock: 90,
    imageUrl: "https://res.cloudinary.com/ujkr9vct/image/upload/v1784709433/Pre-Seasoned_Cast_Iron_Skillet_szzjiw.jpg",
    isFeatured: true
  },

  // --- SPORTS (5 products) ---
  {
    name: "Yoga Mat with Alignment Lines",
    description: "Eco-friendly, non-slip yoga mat designed for perfect posture and balance during your workout routines.",
    price: 42.00,
    category: "Sports",
    stock: 15,
    imageUrl: "https://res.cloudinary.com/ujkr9vct/image/upload/v1784709433/Yoga_Mat_with_Alignment_Lines_wrensc.jpg",
    isFeatured: false
  },
  {
    name: "Adjustable Smart Dumbbell",
    description: "Space-saving dumbbell that adjusts from 5 to 52 lbs with the simple turn of a dial.",
    price: 199.99,
    category: "Sports",
    stock: 4,
    imageUrl: "https://res.cloudinary.com/ujkr9vct/image/upload/v1784709433/Adjustable_Smart_Dumbbell_tctv5f.jpg",
    isFeatured: true
  },
  {
    name: "High-Speed Aluminum Jump Rope",
    description: "Professional-grade jump rope with smooth ball bearings and adjustable cable length for intense cardio sessions.",
    price: 18.50,
    category: "Sports",
    stock: 110,
    imageUrl: "https://res.cloudinary.com/ujkr9vct/image/upload/v1784709432/High-Speed_Aluminum_Jump_Rope_dbr7j4.jpg",
    isFeatured: false
  },
  {
    name: "Heavy Duty Resistance Band Set",
    description: "Set of 5 color-coded resistance bands ranging from 10 to 50 lbs. Includes handles, door anchor, and carrying bag.",
    price: 32.99,
    category: "Sports",
    stock: 55,
    imageUrl: "https://res.cloudinary.com/ujkr9vct/image/upload/v1784709433/Heavy_Duty_Resistance_Band_Set_oaksll.jpg",
    isFeatured: false
  },
  {
    name: "Insulated Stainless Steel Water Bottle",
    description: "32oz double-wall vacuum insulated bottle. Keeps drinks ice cold for 24 hours or piping hot for 12 hours.",
    price: 28.00,
    category: "Sports",
    stock: 250,
    imageUrl: "https://res.cloudinary.com/ujkr9vct/image/upload/v1784709433/Insulated_Stainless_Steel_Water_Bottle_asgu3c.jpg",
    isFeatured: true
  }
];

async function runSeed() {
  console.log(`\n🚀 Starting to seed ${productsToSeed.length} products to ${API_URL}...\n`);
  
  let successCount = 0;
  let failCount = 0;

  for (const product of productsToSeed) {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(product),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log(`✅ Success: Added "${product.name}"`);
        successCount++;
      } else {
        console.error(`❌ Failed: Could not add "${product.name}"`);
        console.error(`   Reason: ${data.message || response.statusText}`);
        failCount++;
      }
    } catch (error) {
      console.error(`❌ Network Error adding "${product.name}":`, error.message);
      console.error(`   Make sure your Next.js server is running!`);
      failCount++;
    }
  }

  console.log("\n-----------------------------------");
  console.log("🏁 Seeding Complete");
  console.log(`   Successfully added: ${successCount}`);
  console.log(`   Failed to add:      ${failCount}`);
  console.log("-----------------------------------\n");
}

runSeed();
