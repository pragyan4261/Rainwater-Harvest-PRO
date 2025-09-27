const ML_SERVICE_URL = import.meta.env.VITE_ML_SERVICE_URL || 'http://localhost:8000';

export interface StateDistrict {
  [stateName: string]: {
    code: string;
    districts: string[];
  };
}

export interface GroundwaterResult {
  groundwater_level: number;
  confidence: number;
  status: string;
  message: string;
  metadata?: {
    latitude: number;
    longitude: number;
    state_code: string;
    model_version: string;
  };
}

class LocationService {
  private statesDistrictsCache: StateDistrict | null = null;

  async getStatesDistricts(): Promise<StateDistrict> {
    if (this.statesDistrictsCache) {
      return this.statesDistrictsCache;
    }

    try {
      const response = await fetch(`${ML_SERVICE_URL}/states-districts`);
      if (!response.ok) {
        throw new Error('Failed to fetch states and districts');
      }
      
      this.statesDistrictsCache = await response.json();
      return this.statesDistrictsCache || this.getFallbackStatesDistricts();
    } catch (error) {
      console.error('Error fetching states and districts:', error);
      // Return fallback data
      return this.getFallbackStatesDistricts();
    }
  }

  async predictGroundwater(
    state: string, 
    district: string, 
    latitude?: number, 
    longitude?: number
  ): Promise<GroundwaterResult> {
    try {
      const response = await fetch(`${ML_SERVICE_URL}/groundwater`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          state,
          district,
          latitude,
          longitude,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to predict groundwater level');
      }

      return await response.json();
    } catch (error) {
      console.error('Error predicting groundwater:', error);
      return {
        groundwater_level: 8.0,
        confidence: 0.5,
        status: 'error',
        message: 'Failed to predict groundwater level',
      };
    }
  }

  private getFallbackStatesDistricts(): StateDistrict {
    return {
      "Andhra Pradesh": {
        "code": "AP",
        "districts": ["Anantapur", "Visakhapatnam", "Vizianagaram"]
      },
      "Arunachal Pradesh": {
        "code": "AR",
        "districts": ["Changlang", "East Siang", "Lohit", "Papum Pare", "Tirap"]
      },
      "Assam": {
        "code": "AS",
        "districts": ["Baksa", "Barpeta", "Bongaigaon", "Cachar", "Chirang", "Darrang", "Dhemaji", "Dhubri", "Dibrugarh", "Goalpara", "Golaghat", "Hailakandi", "Jorhat", "Kamrup", "Kamrup Metropolitan", "Karbi Anglong", "Karimganj", "Kokrajhar", "Lakhimpur", "Marigaon", "Nagaon", "Nalbari", "Sivasagar", "Sonitpur", "Tinsukia", "Udalguri"]
      },
      "Bihar": {
        "code": "BR",
        "districts": ["Araria", "Arwal", "Aurangabad", "Banka", "Begusarai", "Bhagalpur", "Bhojpur", "Buxar", "Darbhanga", "Gaya", "Gopalganj", "Jamui", "Jehanabad", "Kishanganj", "Lakhisarai", "Madhepura", "Nawada", "Pashchim Champaran", "Patna", "Saharsa", "Saran (chhapra)", "Sheikhpura", "Sheohar", "Sitamarhi", "Siwan", "Supaul", "Vaishali"]
      },
      "Chhattisgarh": {
        "code": "CG",
        "districts": ["Bastar", "Bijapur", "Dakshin Bastar Dantewada", "Dhamtari", "Janjgir-champa", "Jashpur", "Kabeerdham", "Korba", "Koriya", "Mahasamund", "Narayanpur", "Raigarh", "Raipur", "Rajnandgaon", "Uttar Bastar Kanker"]
      },
      "Chandigarh": {
        "code": "CH",
        "districts": ["Chandigarh"]
      },
      "Daman and Diu": {
        "code": "DD",
        "districts": ["Daman", "Diu"]
      },
      "Delhi": {
        "code": "DL",
        "districts": ["Central", "East", "New Delhi", "North", "North East", "North West", "South", "South West", "West"]
      },
      "Goa": {
        "code": "GA",
        "districts": ["North Goa", "South Goa"]
      },
      "Gujarat": {
        "code": "GJ",
        "districts": ["Ahmadabad", "Amreli", "Banas Kantha", "Bharuch", "Bhavnagar", "Dohad", "Gandhinagar", "Jamnagar", "Junagadh", "Kachchh", "Mahesana", "Narmada", "Navsari", "Panch Mahals", "Patan", "Porbandar", "Rajkot", "Sabar Kantha", "Surendranagar", "Tapi", "The Dangs", "Vadodara", "Valsad"]
      },
      "Himachal Pradesh": {
        "code": "HP",
        "districts": ["Hamirpur", "Kullu", "Mandi", "Sirmaur", "Solan", "Una"]
      },
      "Haryana": {
        "code": "HR",
        "districts": ["Ambala", "Bhiwani", "Faridabad", "Fatehabad", "Gurgaon", "Jhajjar", "Jind", "Kaithal", "Karnal", "Kurukshetra", "Mahendragarh", "Palwal", "Panchkula", "Panipat", "Rewari", "Rohtak", "Sirsa", "Sonipat", "Yamunanagar"]
      },
      "Jharkhand": {
        "code": "JH",
        "districts": ["Bokaro", "Chatra", "Deoghar", "Dhanbad", "Dumka", "Garhwa", "Giridih", "Godda", "Hazaribagh", "Jamtara", "Khunti", "Kodarma", "Latehar", "Lohardaga", "Palamu", "Pashchimi Singhbhum", "Purbi Singhbhum", "Ramgarh", "Ranchi", "Sahibganj", "Saraikela-kharsawan", "Simdega"]
      },
      "Jammu and Kashmir": {
        "code": "JK",
        "districts": ["Data Not Available", "Jammu", "Kathua", "Rajouri", "Reasi", "Samba", "Udhampur"]
      },
      "Karnataka": {
        "code": "KA",
        "districts": ["Bagalkot", "Bangalore", "Bangalore Rural", "Belgaum", "Bellary", "Bidar", "Bijapur", "Chamrajnagar", "Chikkaballapura", "Chikmagalur", "Chitradurga", "Dakshina Kannada", "Davanagere", "Dharwad", "Gadag", "Gulbarga", "Hassan", "Haveri", "Kodagu", "Kolar", "Koppal", "Mandya", "Mysore", "Raichur", "Ramanagara", "Shimoga", "Tumkur", "Udupi", "Uttara Kannada", "Yadgir"]
      },
      "Kerala": {
        "code": "KL",
        "districts": ["Alappuzha", "Ernakulam", "Idukki", "Kannur", "Kasaragod", "Kollam", "Kottayam", "Kozhikode", "Malappuram", "Palakkad", "Pathanamthitta", "Thiruvananthapuram", "Thrissur", "Wayanad"]
      },
      "Meghalaya": {
        "code": "ML",
        "districts": ["East Garo Hills", "East Khasi Hills", "Jaintia Hills", "Ri Bhoi", "South Garo Hills", "West Garo Hills", "West Khasi Hills"]
      },
      "Manipur": {
        "code": "MN",
        "districts": ["Thoubal"]
      },
      "Madhya Pradesh": {
        "code": "MP",
        "districts": ["Alirajpur", "Anuppur", "Ashoknagar", "Balaghat", "Betul", "Bhind", "Bhopal", "Burhanpur", "Chhatarpur", "Chhindwara", "Damoh", "Datia", "Dewas", "Dhar", "East Nimar", "Guna", "Gwalior", "Harda", "Hoshangabad", "Indore", "Jhabua", "Katni", "Mandla", "Mandsaur", "Morena", "Narsimhapur", "Neemuch", "Panna", "Raisen", "Rajgarh", "Ratlam", "Rewa", "Sagar", "Satna", "Sehore", "Seoni", "Shahdol", "Shajapur", "Sheopur", "Sidhi", "Singrauli", "Tikamgarh", "Ujjain", "Umaria", "Vidisha", "West Nimar"]
      },
      "Maharashtra": {
        "code": "MS",
        "districts": ["Ahmadnagar", "Akola", "Amravati", "Aurangabad", "Bhandara", "Bid", "Buldana", "Chandrapur", "Dhule", "Garhchiroli", "Gondiya", "Hingoli", "Jalgaon", "Jalna", "Kolhapur", "Latur", "Mumbai", "Mumbai Suburban", "Nagpur", "Nanded", "Nandurbar", "Nashik", "Osmanabad", "Parbhani", "Pune", "Raigarh", "Ratnagiri", "Sangli", "Satara", "Solapur", "Thane", "Wardha", "Washim", "Yavatmal"]
      },
      "Nagaland": {
        "code": "NL",
        "districts": ["Dimapur", "Kohima", "Mokokchung", "Mon", "Wokha"]
      },
      "Odisha": {
        "code": "OD",
        "districts": ["Anugul", "Balangir", "Bargarh", "Bauda", "Bhadrak", "Cuttack", "Debagarh", "Gajapati", "Jajapur", "Jharsuguda", "Kandhamal", "Kendrapara", "Khordha", "Malkangiri", "Mayurbhanj", "Nabarangapur", "Nuapada", "Sambalpur", "Sundargarh"]
      },
      "Punjab": {
        "code": "PB",
        "districts": ["Amritsar", "Barnala", "Bathinda", "Faridkot", "Fatehgarh Sahib", "Gurdaspur", "Hoshiarpur", "Jalandhar", "Kapurthala", "Ludhiana", "Mansa", "Moga", "Patiala", "Rupnagar", "Sahibzada Ajit Singh Nagar", "Sangrur", "Shahid Bhagat Singh Nagar", "Tarn Taran"]
      },
      "Puducherry": {
        "code": "PY",
        "districts": ["Karaikal", "Puducherry", "Yanam"]
      },
      "Rajasthan": {
        "code": "RJ",
        "districts": ["Ajmer", "Alwar", "Banswara", "Baran", "Barmer", "Bharatpur", "Bhilwara", "Bikaner", "Bundi", "Chittaurgarh", "Churu", "Dausa", "Dhaulpur", "Dungarpur", "Ganganagar", "Hanumangarh", "Jaipur", "Jaisalmer", "Jalor", "Jhalawar", "Jhunjhunun", "Jodhpur", "Karauli", "Kota", "Nagaur", "Pali", "Pratapgarh", "Rajsamand", "Sawai Madhopur", "Sikar", "Sirohi", "Tonk", "Udaipur"]
      },
      "Tamil Nadu": {
        "code": "TN",
        "districts": ["Chennai", "Coimbatore", "Dharmapuri", "Dindigul", "Kanniyakumari", "Karur", "Krishnagiri", "Nagappattinam", "Namakkal", "Perambalur", "Ramanathapuram", "The Nilgiris", "Thoothukkudi", "Tirunelveli", "Tiruppur", "Viluppuram", "Virudunagar"]
      },
      "Tripura": {
        "code": "TR",
        "districts": ["Dhalai", "North Tripura", "West Tripura"]
      },
      "Uttarakhand": {
        "code": "UK",
        "districts": ["Champawat", "Dehradun", "Hardwar", "Nainital", "Udham Singh Nagar"]
      },
      "Uttar Pradesh": {
        "code": "UP",
        "districts": ["Agra", "Allahabad", "Ambedkar Nagar", "Auraiya", "Azamgarh", "Baghpat", "Balrampur", "Banda", "Bareilly", "Budaun", "Bulandshahr", "Chitrakoot", "Deoria", "Etawah", "Fatehpur", "Firozabad", "Gautam Buddha Nagar", "Ghaziabad", "Ghazipur", "Hamirpur", "Hardoi", "Jalaun", "Jhansi", "Jyotiba Phule Nagar", "Kanpur Dehat", "Kanpur Nagar", "Kansiram Nagar", "Kaushambi", "Kushinagar", "Lalitpur", "Lucknow", "Mahamaya Nagar", "Maharajganj", "Mahoba", "Mainpuri", "Mathura", "Mau", "Meerut", "Mirzapur", "Moradabad", "Muzaffarnagar", "Pilibhit", "Pratapgarh", "Rampur", "Saharanpur", "Sant Kabir Nagar", "Sant Ravi Das Nagar(bhadohi)", "Shrawasti", "Sonbhadra", "Sultanpur", "Unnao", "Varanasi"]
      },
      "West Bengal": {
        "code": "WB",
        "districts": ["Bankura", "Barddhaman", "Birbhum", "Darjiling", "Hugli", "Jalpaiguri", "Koch Bihar", "Maldah", "Nadia", "Pashchim Medinipur", "Uttar Dinajpur"]
      }
    };
  }
}

export const locationService = new LocationService();