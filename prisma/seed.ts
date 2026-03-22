import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const SPRITE = (name: string) => `https://play.pokemonshowdown.com/sprites/trainers/${name}.png`

async function main() {
  // Clear existing data
  await prisma.booking.deleteMany()
  await prisma.lesson.deleteMany()
  await prisma.instructor.deleteMany()
  await prisma.lessonCategory.deleteMany()
  await prisma.pokemonStudent.deleteMany()

  // --- Categories (1 per type, 18 total) ---
  const categories = await Promise.all([
    prisma.lessonCategory.create({ data: { name: 'Swim Training', description: 'Master water techniques — from Surf to Hydro Pump. Pool and open-water drills included.', allowedTypes: 'water' } }),
    prisma.lessonCategory.create({ data: { name: 'Fire Control', description: 'Learn to harness flames safely. Covers Flamethrower accuracy, heat resistance, and ember containment.', allowedTypes: 'fire' } }),
    prisma.lessonCategory.create({ data: { name: 'Martial Arts', description: 'Close-combat fundamentals — punches, kicks, and submission holds. Focus on form and power.', allowedTypes: 'fighting' } }),
    prisma.lessonCategory.create({ data: { name: 'Flight Training', description: 'Aerial maneuvers, speed dives, and wind-riding techniques for Pokemon that own the skies.', allowedTypes: 'flying' } }),
    prisma.lessonCategory.create({ data: { name: 'Endurance Training', description: 'Build stamina and toughness through obstacle courses, weight training, and marathon runs.', allowedTypes: 'normal,rock,fighting' } }),
    prisma.lessonCategory.create({ data: { name: 'Voltage Workshop', description: 'Channel electricity with precision. Covers Thunderbolt targeting, charge storage, and discharge control.', allowedTypes: 'electric' } }),
    prisma.lessonCategory.create({ data: { name: 'Botanical Growth', description: 'Photosynthesis optimization, vine control, and spore techniques for grass-type Pokemon.', allowedTypes: 'grass' } }),
    prisma.lessonCategory.create({ data: { name: 'Frost Conditioning', description: 'Sub-zero survival skills — ice beam accuracy, blizzard formation, and cold endurance.', allowedTypes: 'ice' } }),
    prisma.lessonCategory.create({ data: { name: 'Toxin Mastery', description: 'Poison application and resistance training. Covers Toxic precision and antidote awareness.', allowedTypes: 'poison' } }),
    prisma.lessonCategory.create({ data: { name: 'Terrain Shaping', description: 'Earthquake control, Dig techniques, and ground manipulation for battlefield dominance.', allowedTypes: 'ground' } }),
    prisma.lessonCategory.create({ data: { name: 'Psychic Focus', description: 'Mental discipline training — telekinesis drills, future sight, and psychic barrier construction.', allowedTypes: 'psychic' } }),
    prisma.lessonCategory.create({ data: { name: 'Bug Tactics', description: 'Swarm coordination, silk spinning, and rapid-strike techniques unique to bug types.', allowedTypes: 'bug' } }),
    prisma.lessonCategory.create({ data: { name: 'Rock Solid Defense', description: 'Stone Edge precision, Rock Polish speed drills, and Stealth Rock placement.', allowedTypes: 'rock' } }),
    prisma.lessonCategory.create({ data: { name: 'Shadow Arts', description: 'Phase through walls, curse techniques, and shadow manipulation for ghost-type Pokemon.', allowedTypes: 'ghost' } }),
    prisma.lessonCategory.create({ data: { name: 'Dragon Mastery', description: 'Unleash Draco Meteor, practice dragon dance, and build the raw power of dragon energy.', allowedTypes: 'dragon' } }),
    prisma.lessonCategory.create({ data: { name: 'Dark Strategy', description: 'Ambush tactics, Sucker Punch timing, and mind-game techniques for dark-type battlers.', allowedTypes: 'dark' } }),
    prisma.lessonCategory.create({ data: { name: 'Steel Forging', description: 'Iron Defense drills, Metal Claw sharpening, and armor reinforcement for steel types.', allowedTypes: 'steel' } }),
    prisma.lessonCategory.create({ data: { name: 'Fairy Charm', description: 'Moonblast targeting, healing wish practice, and enchantment techniques for fairy-type Pokemon.', allowedTypes: 'fairy' } }),
  ])

  // Map by name for easy lookup
  const cat = Object.fromEntries(categories.map((c) => [c.name, c]))

  // --- Instructors (12 trainers with Showdown sprites) ---
  const instructors = await Promise.all([
    prisma.instructor.create({ data: { name: 'Misty', spriteUrl: SPRITE('misty'), specialties: [cat['Swim Training'].id].join(',') } }),
    prisma.instructor.create({ data: { name: 'Blaine', spriteUrl: SPRITE('blaine'), specialties: [cat['Fire Control'].id].join(',') } }),
    prisma.instructor.create({ data: { name: 'Bruno', spriteUrl: SPRITE('bruno'), specialties: [cat['Martial Arts'].id, cat['Endurance Training'].id].join(',') } }),
    prisma.instructor.create({ data: { name: 'Falkner', spriteUrl: SPRITE('falkner'), specialties: [cat['Flight Training'].id].join(',') } }),
    prisma.instructor.create({ data: { name: 'Lt. Surge', spriteUrl: SPRITE('ltsurge'), specialties: [cat['Voltage Workshop'].id].join(',') } }),
    prisma.instructor.create({ data: { name: 'Erika', spriteUrl: SPRITE('erika'), specialties: [cat['Botanical Growth'].id, cat['Toxin Mastery'].id].join(',') } }),
    prisma.instructor.create({ data: { name: 'Pryce', spriteUrl: SPRITE('pryce'), specialties: [cat['Frost Conditioning'].id].join(',') } }),
    prisma.instructor.create({ data: { name: 'Giovanni', spriteUrl: SPRITE('giovanni'), specialties: [cat['Terrain Shaping'].id].join(',') } }),
    prisma.instructor.create({ data: { name: 'Sabrina', spriteUrl: SPRITE('sabrina'), specialties: [cat['Psychic Focus'].id].join(',') } }),
    prisma.instructor.create({ data: { name: 'Burgh', spriteUrl: SPRITE('burgh'), specialties: [cat['Bug Tactics'].id].join(',') } }),
    prisma.instructor.create({ data: { name: 'Brock', spriteUrl: SPRITE('brock'), specialties: [cat['Rock Solid Defense'].id, cat['Steel Forging'].id].join(',') } }),
    prisma.instructor.create({ data: { name: 'Morty', spriteUrl: SPRITE('morty'), specialties: [cat['Shadow Arts'].id].join(',') } }),
    prisma.instructor.create({ data: { name: 'Lance', spriteUrl: SPRITE('lance'), specialties: [cat['Dragon Mastery'].id].join(',') } }),
    prisma.instructor.create({ data: { name: 'Karen', spriteUrl: SPRITE('karen'), specialties: [cat['Dark Strategy'].id].join(',') } }),
    prisma.instructor.create({ data: { name: 'Valerie', spriteUrl: SPRITE('valerie'), specialties: [cat['Fairy Charm'].id].join(',') } }),
  ])

  // Map by name
  const ins = Object.fromEntries(instructors.map((i) => [i.name, i]))

  // --- Lessons: 2 per category (tomorrow 10am + day-after 2pm) ---
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(10, 0, 0, 0)

  const dayAfter = new Date()
  dayAfter.setDate(dayAfter.getDate() + 2)
  dayAfter.setHours(14, 0, 0, 0)

  const lessonPairs: Array<{ categoryName: string; instructorName: string }> = [
    { categoryName: 'Swim Training', instructorName: 'Misty' },
    { categoryName: 'Fire Control', instructorName: 'Blaine' },
    { categoryName: 'Martial Arts', instructorName: 'Bruno' },
    { categoryName: 'Flight Training', instructorName: 'Falkner' },
    { categoryName: 'Endurance Training', instructorName: 'Bruno' },
    { categoryName: 'Voltage Workshop', instructorName: 'Lt. Surge' },
    { categoryName: 'Botanical Growth', instructorName: 'Erika' },
    { categoryName: 'Frost Conditioning', instructorName: 'Pryce' },
    { categoryName: 'Toxin Mastery', instructorName: 'Erika' },
    { categoryName: 'Terrain Shaping', instructorName: 'Giovanni' },
    { categoryName: 'Psychic Focus', instructorName: 'Sabrina' },
    { categoryName: 'Bug Tactics', instructorName: 'Bugsy' },
    { categoryName: 'Rock Solid Defense', instructorName: 'Brock' },
    { categoryName: 'Shadow Arts', instructorName: 'Morty' },
    { categoryName: 'Dragon Mastery', instructorName: 'Lance' },
    { categoryName: 'Dark Strategy', instructorName: 'Karen' },
    { categoryName: 'Steel Forging', instructorName: 'Brock' },
    { categoryName: 'Fairy Charm', instructorName: 'Valerie' },
  ]

  for (const { categoryName, instructorName } of lessonPairs) {
    const category = cat[categoryName]
    const instructor = ins[instructorName]
    await prisma.lesson.create({ data: { categoryId: category.id, instructorId: instructor.id, datetime: new Date(tomorrow), maxCapacity: 3 } })
    await prisma.lesson.create({ data: { categoryId: category.id, instructorId: instructor.id, datetime: new Date(dayAfter), maxCapacity: 3 } })
  }

  console.log(`Seed complete: ${categories.length} categories, ${instructors.length} instructors, ${lessonPairs.length * 2} lessons`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
