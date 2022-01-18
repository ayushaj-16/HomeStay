const mongoose   = require('mongoose'),
      Accomodation = require('./models/accomodation'),
      Comment    = require('./models/comment'); 
var seeds = [
  {
    name: "Tso Moriri Lake, Ladakh",
    image: "https://www.holidify.com/images/cmsuploads/compressed/640px-Tsomoriri_Lake_DSC4010_20190212171119.jpg",
    description: "Tsomoriri Lake is the highest lake in the world and located in Ladakh. Camping here is the experience of a lifetime. The lake is completely frozen during the winters and is an excitingly unique thing to witness. The best time to camp here is during May to September and it is simply wonderful to spend time in the decorated tents. You can trek in the nearby Ladakh region and witness the mesmerizing sunset at the lake. The best part is that the tents are comfortable with electricity supply."
  },
  {
    name: "Camp Exotica, Kullu",
    image: "https://www.holidify.com/images/cmsuploads/compressed/tent-1208201_1920_20190212172038.jpg",
    description: "The Camp Exotica is a perfect weekend getaway option located in Kullu in the Manali district of Himachal Pradesh. The accommodation provided is world class and the tents simply leave you connecting with nature like never before. The location of these tents is such that it gives a panoramic view of the surrounding mountains. The food provided is of fine quality and the incredible view will simply leave you in awe of this adventure. Make sure to take out time for this pleasure full camping trip."
  },
  {
    name: "Camp Room on the Roof, Dehradun",
    image: "https://www.holidify.com/images/cmsuploads/compressed/3473170977_c73bf27a6f_z_20190212173011.jpg",
    description: "A more than perfect camp for the adventure enthusiasts, the Camp Room on the Roof is situated 25 km from Chakrata, a quaint town near Dehradun. This camp is located on the step farms giving it a mind-blowing view. From the campsite, you can enjoy the view of the Virratkhai Valley. Setting up base here, you can head off to pursue activities like mountaineering, mountain biking, or rafting in the pristine Yamuna River. The surrounding view will calm the vistas of your mind."
  },
  {
    name: "Rishikesh Valley camp, Rishikesh",
    image: "https://www.holidify.com/images/cmsuploads/compressed/3418318319_6caa7d0cfe_z_20190212173233.jpg",
    description: "When it comes to camping, Rishikesh Camping experience has to be on the list! This amazing Rishikesh Valley camp is not only close to nature but also has a more spiritual connection. The tents here are styled in a hermit fashion and are designed to give you total aloof time. This camp is your go-to place if you are looking for a chance to introspect your inner self. The food served here is entirely organic. Apart from detoxifying, you can undertake rafting, trekking, ayurvedic spas and the grand elephant rides. Camping in Rishikesh is one of the best in India!"
  },
  {
    name: "Kipling Camp, Madhya Pradesh",
    image: "https://www.holidify.com/images/cmsuploads/compressed/4133327541_b597f6451b_z_20190212174017.jpg",
    description: "Camping in the largest protected Tiger Reserve in the country has to be an unparalleled experience, right? The Kipling Camp is located in the Kanha National Park in Madhya Pradesh. This campsite is in the Satpura Hills refreshed by the water of the Narmada. Camping here lets you experience the dense wild forest and amazingly calm weather. The best thing to do here is to go bird watching or pursue a jungle safari. This one is a complete family vacation spot with the chance to make joyous memories."
  },
  {
    name: "West Ladakh Camp, Ladakh",
    image: "https://www.holidify.com/images/cmsuploads/compressed/24366507140_38f32204a4_z_20190212174301.jpg",
    description: "If you are planning to go on a trekking trip to Ladakh, you can make it even more adventurous by camping at the West Ladakh Camp. This beautiful campsite is sprawled across 20 acres of ranch and is ideally situated close to the Indus River. The tents are so placed that these are surrounded by apricot and willow trees which nest the migratory birds. You can set your base here and go trekking in the nearby region and visit the Buddhist Monasteries. The food served here is authentic Tibetan and Ladakhi food making it a unique culinary experience."
  },
  {
    name: "Nameri Eco Camp, Assam",
    image: "https://www.holidify.com/images/cmsuploads/compressed/4877785757_958e85201d_z_20190212174518.jpg",
    description: "Going by the name one thing must be clear that it is a 100% eco-friendly camp. This camp has become one of the most sought after because of its superb location and the environmental protection efforts. It is located in the district of Sonetpur which is the 3rd National Park of Assam. This camp is not only known for its splendid location but also its various adventure activities. You can go on a hike in the nearby woods or for an exciting rafting session in the Bhoroli River. The best part of this place is the chance of spotting over 300 species of birds. This does sound like a bird lover’s paradise."
  },
  {
    name: "Sangla Valley Camping, Sangla",
    image: "https://www.holidify.com/images/cmsuploads/compressed/Sangla_valley_03_20190214130336jpg",
    description: "Sangla valley is an alluring valley in the Trans-Himalayan region and is a hotspot for tourists. It is a sought after place during the summers when the valley comes alive with tourists visiting from all parts of the world. Hidden away in the Himalayan region this is one picturesque valley which is untouched by the pollution of the big cities. There is a place called Kaza nearby which is the adventure hub of this place. Blending the culture and adventure, this camping site is perfect for travel enthusiasts."
  },
  {
    name: "Magpie Camp, Chopta",
    image: "https://www.holidify.com/images/cmsuploads/compressed/adventure-camp-camping-699558_20190212181323.jpg",
    description: "Chopta is one destination which has recently made it to the list of the best offbeat destination in the country. It is a little place tucked away in the Garhwal Mountains and is the best retreat to beat the summer heat. The Magpie Camp in Chopta lets you experience this place in its true form. The view of the surrounding valley and mountains is enough to take your breath away. There are several tourist sites here like the Chandrashila Peak, Deoria Tal, and Tungnath Temple. This is one place that deserves your time."
  },
  {
    name: "Sarchu, Manali",
    image: "https://www.holidify.com/images/cmsuploads/compressed/6677326239_f4074c97b8_z_20190212181551.jpg",
    description: "The Sarchu campsite is around 220 km from Manali and is ideally located on the Manali-Leh highway. It makes for a perfect overnight stay en-route the road to Manali. The travellers who undertake the arduous trek in the nearby Zanskar region, often start their journey from this point. The camp is quite comfortable with a separate dining tent and a complete electricity facility. It is also one of the off-beat places to celebrate your birthday in an unconventional style as they offer birthday cakes on request!"
  }
];

async function SeedDB() {
  try {
    //Remove all Accomodations and Comments
    await Accomodation.deleteMany({});
    console.log("Accomodations removed!");
    await Comment.deleteMany({});
    console.log("Comments removed!");
    //Add a few Accomodations
    for (const seed of seeds) {
      seed.price = 999;
      seed.author = {
        id: "5f3565add5d2f51d6c780f38",
        "username": "AyushAJ"
      }
      let accomodation = await Accomodation.create(seed);
      console.log("Accomodation created!");
      let comment = await Comment.create( {
        text: "This place is great, but I wish there was Internet",
        author: {
          "id": "5f3565add5d2f51d6c780f38",
          "username": "AyushAJ"
        }
      });
      console.log("Comment created!");
      accomodation.comments.push(comment);
      accomodation.save();
      console.log("Comment added to accomodation!");
    }
  } catch(err) {
    console.log(err);
  }
}

module.exports = SeedDB;