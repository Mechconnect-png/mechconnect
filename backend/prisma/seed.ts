import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding MechConnect database with 5 Chennai Mechanics...");

  const hashedPassword = await bcrypt.hash("password123", 10);

  // 1. Service Types
  const serviceTypes = [
    {
      key: "BATTERY",
      name: "Battery Assistance & Jumpstart",
      category: "Electrical",
      basePrice: 450,
      estimatedDurationMinutes: 20,
      iconName: "Zap",
      description: "Jumpstart weak battery or test alternator voltage on-site."
    },
    {
      key: "TYRE",
      name: "Flat Tyre Repair & Swap",
      category: "Wheels",
      basePrice: 350,
      estimatedDurationMinutes: 25,
      iconName: "Disc",
      description: "On-site tubeless puncture repair or spare wheel installation."
    },
    {
      key: "FUEL",
      name: "Emergency Fuel Delivery",
      category: "Fuel",
      basePrice: 400,
      estimatedDurationMinutes: 20,
      iconName: "Fuel",
      description: "Delivery of up to 5 Litres of Petrol or Diesel to your location."
    },
    {
      key: "ENGINE",
      name: "Engine Diagnostic & Repair",
      category: "Mechanical",
      basePrice: 650,
      estimatedDurationMinutes: 45,
      iconName: "Wrench",
      description: "Diagnostic check for stalling engine, noise, or oil leaks."
    },
    {
      key: "OVERHEATING",
      name: "Coolant & Cooling System",
      category: "Engine",
      basePrice: 550,
      estimatedDurationMinutes: 30,
      iconName: "Flame",
      description: "Coolant top-up, hose leak inspection, and radiator fan check."
    },
    {
      key: "TOWING",
      name: "Flatbed Emergency Towing",
      category: "Towing",
      basePrice: 1500,
      estimatedDurationMinutes: 40,
      iconName: "Truck",
      description: "Safe flatbed vehicle transport to nearest authorized service station."
    },
    {
      key: "ELECTRICAL",
      name: "Electrical & Fuse Repair",
      category: "Electrical",
      basePrice: 500,
      estimatedDurationMinutes: 35,
      iconName: "Cpu",
      description: "Short circuit repair, headlight failure, or blown fuse replacement."
    }
  ];

  for (const st of serviceTypes) {
    await prisma.serviceType.upsert({
      where: { key: st.key },
      update: st,
      create: st
    });
  }

  // 2. Customer User
  await prisma.user.upsert({
    where: { email: "customer@mechconnect.com" },
    update: {},
    create: {
      email: "customer@mechconnect.com",
      password: hashedPassword,
      name: "Rahul Sharma",
      phone: "+91 98765 43210",
      role: "CUSTOMER",
      customer: {
        create: {
          defaultAddress: "Anna Nagar West, Chennai",
          lat: 13.0827,
          lng: 80.2707,
          vehicles: {
            create: [
              {
                type: "FOUR_WHEELER",
                brand: "Honda",
                model: "City i-VTEC",
                year: 2022,
                regNumber: "TN 07 CX 4589",
                fuelType: "Petrol",
                isPrimary: true
              },
              {
                type: "TWO_WHEELER",
                brand: "Royal Enfield",
                model: "Classic 350",
                year: 2021,
                regNumber: "TN 09 BK 1234",
                fuelType: "Petrol",
                isPrimary: false
              }
            ]
          }
        }
      }
    }
  });

  // 3. 5 Chennai Mechanics Data
  const chennaiMechanics = [
    {
      email: "mechanic@mechconnect.com",
      name: "Karthik Raja (Pro Mechanic)",
      phone: "+91 91234 56789",
      bio: "10+ Years Certified Automobile Specialist in Electrical & Engine Diagnostics",
      skills: ["Battery", "Tyre", "Engine", "Electrical", "General Service"],
      experienceYears: 10,
      hourlyRate: 400,
      rating: 4.9,
      totalRatings: 48,
      lat: 13.0890,
      lng: 80.2750 // Anna Nagar
    },
    {
      email: "mechanic2@mechconnect.com",
      name: "Suresh Kumar (Speedy Auto)",
      phone: "+91 99887 76655",
      bio: "Roadside Breakdown & Flatbed Towing Specialist",
      skills: ["Towing", "Tyre", "Fuel", "Battery"],
      experienceYears: 6,
      hourlyRate: 350,
      rating: 4.7,
      totalRatings: 29,
      lat: 13.0418,
      lng: 80.2341 // T. Nagar
    },
    {
      email: "mechanic3@mechconnect.com",
      name: "Anbarasan (Adyar Express)",
      phone: "+91 98400 11223",
      bio: "Heavy Duty Towing & Engine Overheating Expert",
      skills: ["Towing", "Flatbed", "Overheating", "Engine"],
      experienceYears: 8,
      hourlyRate: 450,
      rating: 4.8,
      totalRatings: 35,
      lat: 13.0012,
      lng: 80.2565 // Adyar
    },
    {
      email: "mechanic4@mechconnect.com",
      name: "Vikram Malhotra (Velachery Motors)",
      phone: "+91 97100 44556",
      bio: "Multi-Brand Engine Diagnostics & Electrical Master Technician",
      skills: ["Engine", "Overheating", "Electrical", "General Service"],
      experienceYears: 5,
      hourlyRate: 380,
      rating: 4.6,
      totalRatings: 18,
      lat: 12.9759,
      lng: 80.2212 // Velachery
    },
    {
      email: "mechanic5@mechconnect.com",
      name: "Rajesh Kannan (Guindy Bike & EV Care)",
      phone: "+91 95000 77889",
      bio: "Two-Wheeler & EV Battery Specialist",
      skills: ["Bike", "EV Care", "Battery", "Tyre"],
      experienceYears: 12,
      hourlyRate: 320,
      rating: 4.9,
      totalRatings: 52,
      lat: 13.0067,
      lng: 80.2020 // Guindy
    }
  ];

  for (const m of chennaiMechanics) {
    const existing = await prisma.user.findUnique({
      where: { email: m.email },
      include: { mechanic: true }
    });

    if (existing) {
      if (existing.mechanic) {
        await prisma.mechanic.update({
          where: { id: existing.mechanic.id },
          data: { isOnline: true, isVerified: true }
        });
      }
    } else {
      await prisma.user.create({
        data: {
          email: m.email,
          password: hashedPassword,
          name: m.name,
          phone: m.phone,
          role: "MECHANIC",
          mechanic: {
            create: {
              bio: m.bio,
              skillsJson: JSON.stringify(m.skills),
              isOnline: true,
              isVerified: true,
              experienceYears: m.experienceYears,
              hourlyRate: m.hourlyRate,
              rating: m.rating,
              totalRatings: m.totalRatings,
              lat: m.lat,
              lng: m.lng
            }
          }
        }
      });
    }
  }

  // 4. Admin User
  await prisma.user.upsert({
    where: { email: "admin@mechconnect.com" },
    update: {},
    create: {
      email: "admin@mechconnect.com",
      password: hashedPassword,
      name: "System Admin",
      phone: "+91 90000 00000",
      role: "ADMIN"
    }
  });

  console.log("✅ MechConnect database seeded successfully!");
  console.log("Seeded 5 Chennai Mechanics (All Online & Verified):");
  chennaiMechanics.forEach(m => console.log(`  🔧 ${m.name} (${m.email})`));
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
