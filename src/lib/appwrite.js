import { Client, Account, ID, Avatars, Databases, Query, Storage } from 'react-native-appwrite';


export const config = {
  endpoint: 'https://cloud.appwrite.io/v1',
  platform: 'com.pixelbay.sargalayam',
  projectId: 'skssfsargalayalmsargalayalamskssfnew',
  databaseId: '674c26af0027e72b8c9c',
  userCollectionId: '674c27e9000fff2fb264',
  videoCollectionoid: '6755623b0013070777bc',
  questionsCollectionId: '674c2a0d0035ec0b02b8',
  quizResponseCollectionId: '674d369300129f0084f9',
  programsCollectionId: '674c2c060001f1f3dd05',
  districtsCollectionId: "674c2ca100265cbd5cc2",
  resultsCollectionId: "6753c04b001397d9613e",
  messageCollectionId: "674d817e00008f5203d5",
  settingsCollectionId:"67556fe5001614d4bf88",
  downloadsCollectionId:"675585c8000dea692e41",
  galleryStorageId: "674e76b20013b1d3dcb4",
  postsCollectionID:"675713f90017735500fb",
  storageId: '674c2d26001b524033e3'
}

const {
  endpoint,
  platform,
  projectId,
  databaseId,
  userCollectionId,
  galleryStorageId,
  messageCollectionId,
  resultsCollectionId,
  districtsCollectionId,
  programsCollectionId,
  questionsCollectionId,
  videoCollectionoid,
  quizResponseCollectionId,
  settingsCollectionId,
  downloadsCollectionId,
  postsCollectionID,
  storageId,
} = config;

// Init your React Native SDK
const client = new Client();

client
  .setEndpoint(config.endpoint) // Your Appwrite Endpoint
  .setProject(config.projectId) // Your project ID
  .setPlatform(config.platform) // Your application ID or bundle ID.
  ;

const account = new Account(client);
const avatars = new Avatars(client);
const databases = new Databases(client);
const storage = new Storage(client)

// Register User

export const createUser = async (email, password, username) => {
  try {
    const newAccount = await account.create(
      ID.unique(),
      email = "muhammedafsalch7@gmail.com",
      password = "Password@2024",
      username = "afsu.me"
    )

    if (!newAccount) throw Error;

    const avatarUrl = avatars.getInitials(username);
    await signIn(email, password)
    const newUser = await databases.createDocument(
      config.databaseId,
      config.userCollectionId,
      ID.unique(),
      {
        accountId: newAccount.$id,
        email,
        username,
        avatar: avatarUrl
      }
    )
    return newUser
  } catch (error) {
    console.log(error);
    throw new Error(error);

  }
}


export const signIn = async (email, password) => {
  try {
    const session = await account.createEmailPasswordSession(
      email,
      password
    );

    return session;
  } catch (error) {
    console.log(error);
    throw new Error(error);

  }
}


export const getCurrentUser = async () => {
  try {

    const currentAccount = await account.get()

    if (!currentAccount) throw Error

    const currentUser = await databases.listDocuments(
      config.databaseId,
      config.userCollectionId,
      [Query.equal('accountId', currentAccount.$id)]
    )

    if (!currentUser) throw Error;


    return currentUser.documents[0];
  } catch (error) {
    console.log(error);
  }
}


export const getAllPosts = async (page = 1, limit = 10) => {
  try {
    // Calculate offset based on the page number
    const offset = (page - 1) * limit;

    // Fetch the documents with pagination
    const posts = await databases.listDocuments(
      databaseId,
      postsCollectionID,
      [
        Query.orderDesc('$createdAt'),
        Query.limit(limit),  // Limit the number of posts
        Query.offset(offset)  // Skip the number of posts based on the page
      ]
    );

    return posts.documents;
  } catch (error) {
    console.log(error);
  }
};


export const getLatestPosts = async () => {
  try {
    const posts = await databases.listDocuments(
      databaseId,
      videoCollectionoid,
      [Query.orderDesc('$createdAt', Query.limit(7))]
    )

    return posts.documents
  } catch (error) {
    throw new Error(error)
  }
}

export const searchPosts = async (query) => {
  console.log(query,"qqq");
  try {
    const posts = await databases.listDocuments(
      databaseId,
      resultsCollectionId,
      [Query.search('itemcode', Number(query))] // Perform search on 'title'
    );

    return posts.documents;
  } catch (error) {
    console.error('Error searching posts:', error);
    
  }
};

export const getUserPosts = async (userId) => {
  try {
    const posts = await databases.listDocuments(
      databaseId,
      videoCollectionoid,
      [Query.equal('creator', userId), [Query.orderDesc('$createdAt')]]
    )

    return posts.documents
  } catch (error) {
    throw new Error(error)
  }
}

export const signOut = async () => {
  try {
    const session = await account.deleteSession('current')
    return session
  } catch (error) {
    throw new Error(error)
  }
}

export const getFilePreview = async (fileId, type) => {
  let fileUrl;

  try {
    if (type === 'video') {
      fileUrl = storage.getFileView(storageId, fileId)
    } else if (type === 'image') {
      fileUrl = storage.getFilePreview(
        storageId,
        fileId,
        2000, 2000, 'top', 100
      )
    } else {
      throw new Error('Invalid file type')
    }
    if (!fileUrl) throw Error;

    return fileUrl
  } catch (error) {
    throw new Error(error)
  }
}

export const uploadFile = async (file, type) => {
  if (!file) return;

  const asset = {
    name: file.fileName,
    type: file.mimeType,
    size: file.fileSize,
    uri: file.uri,
  }

  try {
    const uploadedFile = await storage.createFile(
      storageId,
      ID.unique(),
      asset
    );

    const fileUrl = await getFilePreview(uploadedFile.$id, type)

    return fileUrl;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw new Error(error.message || "File upload failed.");
  }
};



export const createVideo = async (form) => {
  try {
    const [thumbnailUrl, videoUrl] = await Promise.all([
      uploadFile(form.thumbnail, 'image'),
      uploadFile(form.video, 'video')

    ]);

    const newPost = await databases.createDocument(
      databaseId, videoCollectionoid, ID.unique(),
      {
        thumbnail: thumbnailUrl,
        video: videoUrl,
        creator: form.userId
      }
    )
    return newPost
  } catch (error) {
    throw new Error(error)
  }
}






export const getAllQuestions = async () => {
  try {
    // Fetch all documents, sorted by creation time (optional)
    const posts = await databases.listDocuments(
      databaseId,
      questionsCollectionId,
      [Query.orderDesc('$createdAt')]
    );

    // Randomize the document array
    const shuffledPosts = posts.documents.sort(() => 0.5 - Math.random());

    // Take the first 15 random documents
    const random15Posts = shuffledPosts.slice(0, 15);

    return random15Posts;
  } catch (error) {
    throw new Error(error);
  }
};



export const checkParticipantExists = async ({ name, mobile }) => {

  try {
    const participant = await databases.listDocuments(
      databaseId,
      quizResponseCollectionId,
      [Query.equal('username', name), Query.equal('mobile', mobile)]
    )
    if (participant.total > 0) {
      return false
    } else {
      return true
    }

  } catch (error) {
    console.log(error);
    throw new Error(error);
  }

}

export const saveQuizResponse = async ({ name, mobile, place, total }) => {
  try {
    const newQuizResponse = await databases.createDocument(
      databaseId, quizResponseCollectionId, ID.unique(),
      {
        username: name,
        mobile: mobile,
        place: place,
        total: total
      }
    )
    return newQuizResponse
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
}

export const addProgram = async () => {


  const documents = [
    {
      "itemcode": 1,
      "itemname": "Faathiha Paaraayanam",
      "itemlabel": "ഫാത്തിഹ പാരായണം",
      "category_code": "G.K",
      "point_category": "B"
    },
    {
      "itemcode": 2,
      "itemname": "Colouring",
      "itemlabel": "കളറിംഗ്",
      "category_code": "G.K",
      "point_category": "C"
    },
    {
      "itemcode": 3,
      "itemname": "Islamic Song",
      "itemlabel": "ഇസ്ലാമിക ഗാനം",
      "category_code": "G.K",
      "point_category": "C"
    },
    {
      "itemcode": 4,
      "itemname": "Book Reading",
      "itemlabel": "പുസ്‌തക വായന",
      "category_code": "G.K",
      "point_category": "C"
    },
    {
      "itemcode": 5,
      "itemname": "Handwriting Arabic",
      "itemlabel": "കയ്യെഴുത്ത് (അറബി)",
      "category_code": "G.K",
      "point_category": "C"
    },
    {
      "itemcode": 6,
      "itemname": "Handwriting English",
      "itemlabel": "കയ്യെഴുത്ത് (ഇംഗ്ലീഷ്)",
      "category_code": "G.K",
      "point_category": "C"
    },
    {
      "itemcode": 7,
      "itemname": "Qiraath",
      "itemlabel": "ഖിറാഅത്ത്",
      "category_code": "G.SJ",
      "point_category": "B"
    },
    {
      "itemcode": 8,
      "itemname": "Madhunnabi Song",
      "itemlabel": "മദ്ഹുന്നബി ഗാനം",
      "category_code": "G.SJ",
      "point_category": "B"
    },
    {
      "itemcode": 9,
      "itemname": "Islamic Popular Song",
      "itemlabel": "ഇസ്‌ലാമിക് പോപ്പുലർ സോങ്",
      "category_code": "G.SJ",
      "point_category": "C"
    },
    {
      "itemcode": 10,
      "itemname": "Arabic Song",
      "itemlabel": "അറബി ഗാനം",
      "category_code": "G.SJ",
      "point_category": "C"
    },
    {
      "itemcode": 11,
      "itemname": "Story Telling",
      "itemlabel": "കഥാ കഥനം",
      "category_code": "G.SJ",
      "point_category": "C"
    },
    {
      "itemcode": 12,
      "itemname": "Quiz",
      "itemlabel": "ക്വിസ്സ്",
      "category_code": "G.SJ",
      "point_category": "C"
    },
    {
      "itemcode": 13,
      "itemname": "Water Coloring",
      "itemlabel": "ചിത്രരചന (വാട്ടർ കളർ )",
      "category_code": "G.SJ",
      "point_category": "C"
    },
    {
      "itemcode": 14,
      "itemname": "Memory Test",
      "itemlabel": "ഓർമ്മ പരിശോധന",
      "category_code": "G.SJ",
      "point_category": "C"
    },
    {
      "itemcode": 15,
      "itemname": "Qiraath",
      "itemlabel": "ഖിറാഅത്ത്",
      "category_code": "G.J",
      "point_category": "B"
    },
    {
      "itemcode": 16,
      "itemname": "Mappila Pattu",
      "itemlabel": "മാപ്പിളപ്പാട്ട്",
      "category_code": "G.J",
      "point_category": "B"
    },
    {
      "itemcode": 17,
      "itemname": "Madhunnabi Song",
      "itemlabel": "മദ്ഹുന്നബി ഗാനം",
      "category_code": "G.J",
      "point_category": "B"
    },
    {
      "itemcode": 18,
      "itemname": "Organizational Song",
      "itemlabel": "സംഘടനാഗാനം",
      "category_code": "G.J",
      "point_category": "B"
    },
    {
      "itemcode": 19,
      "itemname": "Malayalam Thanima",
      "itemlabel": "മലയാളത്തനിമ",
      "category_code": "G.J",
      "point_category": "C"
    },
    {
      "itemcode": 20,
      "itemname": "Mal. Elocution",
      "itemlabel": "മലയാള പ്രസംഗം",
      "category_code": "G.J",
      "point_category": "B"
    },
    {
      "itemcode": 21,
      "itemname": "Azan",
      "itemlabel": "വാങ്ക്",
      "category_code": "G.J",
      "point_category": "C"
    },
    {
      "itemcode": 22,
      "itemname": "Quiz",
      "itemlabel": "ക്വിസ്സ്",
      "category_code": "G.J",
      "point_category": "C"
    },
    {
      "itemcode": 23,
      "itemname": "Vocabulary Contest",
      "itemlabel": "ഇംഗ്ലീഷ് പദപ്പയറ്റ്",
      "category_code": "G.J",
      "point_category": "B"
    },
    {
      "itemcode": 24,
      "itemname": "Pencil Drawing",
      "itemlabel": "പെൻസിൽ ഡ്രോയിങ്",
      "category_code": "G.J",
      "point_category": "C"
    },
    {
      "itemcode": 25,
      "itemname": "Qiraath",
      "itemlabel": "ഖിറാഅത്ത്",
      "category_code": "G.S",
      "point_category": "B"
    },
    {
      "itemcode": 26,
      "itemname": "Commemorative Song",
      "itemlabel": "അനുസ്‌മരണ ഗാനം",
      "category_code": "G.S",
      "point_category": "C"
    },
    {
      "itemcode": 27,
      "itemname": "Mappilappattu",
      "itemlabel": "മാപ്പിളപ്പാട്ട്",
      "category_code": "G.S",
      "point_category": "B"
    },
    {
      "itemcode": 28,
      "itemname": "Malayalam Elocution",
      "itemlabel": "മലയാള പ്രസംഗം",
      "category_code": "G.S",
      "point_category": "B"
    },
    {
      "itemcode": 29,
      "itemname": "Azan",
      "itemlabel": "വാങ്ക്",
      "category_code": "G.S",
      "point_category": "C"
    },
    {
      "itemcode": 30,
      "itemname": "Padhya Parayanam",
      "itemlabel": "പദ്യ പാരായണം (മലയാളം)",
      "category_code": "G.S",
      "point_category": "C"
    },
    {
      "itemcode": 31,
      "itemname": "Padi Parayal",
      "itemlabel": "പാടി പറയൽ",
      "category_code": "G.S",
      "point_category": "B"
    },
    {
      "itemcode": 32,
      "itemname": "Allafal Alif",
      "itemlabel": "അല്ലഫൽ അലിഫ്",
      "category_code": "G.S",
      "point_category": "C"
    },
    {
      "itemcode": 33,
      "itemname": "Quiz",
      "itemlabel": "ക്വിസ്സ്",
      "category_code": "G.S",
      "point_category": "C"
    },
    {
      "itemcode": 34,
      "itemname": "Poster Designing",
      "itemlabel": "പോസ്റ്റർ ഡിസൈനിംഗ്",
      "category_code": "G.S",
      "point_category": "C"
    },
    {
      "itemcode": 35,
      "itemname": "Digital Poster Design",
      "itemlabel": "ഡിജിറ്റൽ പോസ്റ്റർ",
      "category_code": "G.S",
      "point_category": "B"
    },
    {
      "itemcode": 36,
      "itemname": "News Reading",
      "itemlabel": "വാർത്താ വായന",
      "category_code": "G.S",
      "point_category": "B"
    },
    {
      "itemcode": 37,
      "itemname": "Essay writing (Mal)",
      "itemlabel": "മലയാള പ്രബന്ധം",
      "category_code": "G.S",
      "point_category": "B"
    },
    {
      "itemcode": 38,
      "itemname": "Arabic Song",
      "itemlabel": "അറബിഗാനം",
      "category_code": "G.SS",
      "point_category": "C"
    },
    {
      "itemcode": 39,
      "itemname": "Mappilappattu",
      "itemlabel": "മാപ്പിളപ്പാട്ട്",
      "category_code": "G.SS",
      "point_category": "B"
    },
    {
      "itemcode": 40,
      "itemname": "Devotional Song",
      "itemlabel": "ഭക്തി ഗാനം",
      "category_code": "G.SS",
      "point_category": "C"
    },
    {
      "itemcode": 41,
      "itemname": "Announcement",
      "itemlabel": "അനൗൺസ്മെന്റ്",
      "category_code": "G.SS",
      "point_category": "C"
    },
    {
      "itemcode": 42,
      "itemname": "Situation Management",
      "itemlabel": "സിറ്റുവേഷൻ മാനേജ്‌മന്റ്റ്",
      "category_code": "G.SS",
      "point_category": "B"
    },
    {
      "itemcode": 43,
      "itemname": "History Talk",
      "itemlabel": "ഹിസ്റ്ററി ടോക്ക്",
      "category_code": "G.SS",
      "point_category": "B"
    },
    {
      "itemcode": 44,
      "itemname": "Quiz",
      "itemlabel": "ക്വിസ്സ്",
      "category_code": "G.SS",
      "point_category": "C"
    },
    {
      "itemcode": 45,
      "itemname": "Song Writing & Singing",
      "itemlabel": "ഗാന രചന & ആലാപനം",
      "category_code": "G.SS",
      "point_category": "A"
    },
    {
      "itemcode": 46,
      "itemname": "Newsletter Preparation",
      "itemlabel": "വാർത്താകുറിപ്പ് തയ്യാറാക്കൽ",
      "category_code": "G.SS",
      "point_category": "C"
    },
    {
      "itemcode": 47,
      "itemname": "Calligraphy",
      "itemlabel": "കാലിഗ്രാഫി അറബി",
      "category_code": "G.SS",
      "point_category": "B"
    },
    {
      "itemcode": 48,
      "itemname": "Versification (Mal)",
      "itemlabel": "കവിതാ രചന (മലയാളം)",
      "category_code": "G.SS",
      "point_category": "C"
    },
    {
      "itemcode": 49,
      "itemname": "Digital Poster Design",
      "itemlabel": "ഡിജിറ്റൽ പോസ്റ്റർ",
      "category_code": "G.SS",
      "point_category": "B"
    },
    {
      "itemcode": 50,
      "itemname": "Reels Making",
      "itemlabel": "റീൽസ് മേക്കിങ്",
      "category_code": "G.SS",
      "point_category": "B"
    },
    {
      "itemcode": 51,
      "itemname": "Group song (Mal)",
      "itemlabel": "സംഘഗാനം (മലയാളം)",
      "category_code": "G.G",
      "point_category": "A"
    },
    {
      "itemcode": 52,
      "itemname": "Group song (Mappila)",
      "itemlabel": "സംഘഗാനം (മാപ്പിളപ്പാട്ട്)",
      "category_code": "G.G",
      "point_category": "A"
    },
    {
      "itemcode": 53,
      "itemname": "Burda recitation",
      "itemlabel": "ബുർദ ആലാപനം",
      "category_code": "G.G",
      "point_category": "A"
    },
    {
      "itemcode": 54,
      "itemname": "Mashup Group song",
      "itemlabel": "മാഷപ്പ് ഗാനം (മലയാളം)",
      "category_code": "G.G",
      "point_category": "A"
    },
    {
      "itemcode": 55,
      "itemname": "Duff muttu",
      "itemlabel": "ദഫ് മുട്ട്",
      "category_code": "G.G",
      "point_category": "A"
    },
    {
      "itemcode": 56,
      "itemname": "Bhakthigeeth",
      "itemlabel": "ഭക്തിഗീത്",
      "category_code": "G.G",
      "point_category": "A"
    },
    {
      "itemcode": 57,
      "itemname": "Qiraath",
      "itemlabel": "ഖിറാഅത്ത്",
      "category_code": "T.J",
      "point_category": "B"
    },
    {
      "itemcode": 58,
      "itemname": "Organizational Song",
      "itemlabel": "സംഘടനാഗാനം",
      "category_code": "T.J",
      "point_category": "B"
    },
    {
      "itemcode": 59,
      "itemname": "Urudu Song",
      "itemlabel": "ഉറുദു ഗാനം",
      "category_code": "T.J",
      "point_category": "C"
    },
    {
      "itemcode": 60,
      "itemname": "Malayalam Elocution",
      "itemlabel": "മലയാള പ്രസംഗം",
      "category_code": "T.J",
      "point_category": "B"
    },
    {
      "itemcode": 61,
      "itemname": "Padhya Parayanam",
      "itemlabel": "പദ്യ പാരായണം (അറബി)",
      "category_code": "T.J",
      "point_category": "C"
    },
    {
      "itemcode": 62,
      "itemname": "Azan",
      "itemlabel": "വാങ്ക്",
      "category_code": "T.J",
      "point_category": "C"
    },
    {
      "itemcode": 63,
      "itemname": "Nano Literature",
      "itemlabel": "നാനോ ലിറ്ററേച്ചർ",
      "category_code": "T.J",
      "point_category": "B"
    },
    {
      "itemcode": 64,
      "itemname": "Essay writing (Mal)",
      "itemlabel": "മലയാള പ്രബന്ധം",
      "category_code": "T.J",
      "point_category": "C"
    },
    {
      "itemcode": 65,
      "itemname": "Qiraath",
      "itemlabel": "ഖിറാഅത്ത്",
      "category_code": "T.S",
      "point_category": "B"
    },
    {
      "itemcode": 66,
      "itemname": "Arabic Song",
      "itemlabel": "അറബിക് ഗാനം",
      "category_code": "T.S",
      "point_category": "C"
    },
    {
      "itemcode": 67,
      "itemname": "Commemorative Song",
      "itemlabel": "അനുസ്‌മരണ ഗാനം",
      "category_code": "T.S",
      "point_category": "C"
    },
    {
      "itemcode": 68,
      "itemname": "Mappilappattu",
      "itemlabel": "മാപ്പിളപ്പാട്ട്",
      "category_code": "T.S",
      "point_category": "B"
    },
    {
      "itemcode": 69,
      "itemname": "Malayalam Elocution",
      "itemlabel": "മലയാള പ്രസംഗം",
      "category_code": "T.S",
      "point_category": "B"
    },
    {
      "itemcode": 70,
      "itemname": "Arabic Elocution",
      "itemlabel": "അറബി പ്രസംഗം",
      "category_code": "T.S",
      "point_category": "B"
    },
    {
      "itemcode": 71,
      "itemname": "English Elocution",
      "itemlabel": "ഇംഗ്ലീഷ് പ്രസംഗം",
      "category_code": "T.S",
      "point_category": "B"
    },
    {
      "itemcode": 72,
      "itemname": "Essay writing (Mal)",
      "itemlabel": "മലയാള പ്രബന്ധം",
      "category_code": "T.S",
      "point_category": "C"
    },
    {
      "itemcode": 73,
      "itemname": "Collage",
      "itemlabel": "കൊളാഷ്",
      "category_code": "T.S",
      "point_category": "A"
    },
    {
      "itemcode": 74,
      "itemname": "Situation Management",
      "itemlabel": "സിറ്റുവേഷൻ മാനേജ്‌മന്റ്റ്",
      "category_code": "T.S",
      "point_category": "B"
    },
    {
      "itemcode": 75,
      "itemname": "Calligraphy",
      "itemlabel": "കാലിഗ്രാഫി അറബി",
      "category_code": "T.S",
      "point_category": "B"
    },
    {
      "itemcode": 76,
      "itemname": "Versification (Mal)",
      "itemlabel": "കവിതാ രചന (മലയാളം)",
      "category_code": "T.S",
      "point_category": "C"
    },
    {
      "itemcode": 77,
      "itemname": "Group Song Mappila",
      "itemlabel": "സംഘഗാനം (മാപ്പിളപ്പാട്ട്)",
      "category_code": "T.G",
      "point_category": "A"
    },
    {
      "itemcode": 78,
      "itemname": "Burda Recitation",
      "itemlabel": "ബുർദ ആലാപനം",
      "category_code": "T.G",
      "point_category": "A"
    },
    {
      "itemcode": 79,
      "itemname": "Bhakthigeeth",
      "itemlabel": "ഭക്തിഗീത്",
      "category_code": "T.G",
      "point_category": "A"
    }
  ];

  // const districts = [
  //   { "districtid": 1, "name": "ALAPPUZHA", "GK": null, "GSJ": null, "GJ": null, "GS": null, "GSS": null, "GG": null, "TJ": null, "TS": null, "TG": null },
  //   { "districtid": 2, "name": "ERNAKULAM", "GK": null, "GSJ": null, "GJ": null, "GS": null, "GSS": null, "GG": null, "TJ": null, "TS": null, "TG": null },
  //   { "districtid": 3, "name": "IDUKKI", "GK": null, "GSJ": null, "GJ": null, "GS": null, "GSS": null, "GG": null, "TJ": null, "TS": null, "TG": null },
  //   { "districtid": 4, "name": "KANNUR", "GK": null, "GSJ": null, "GJ": null, "GS": null, "GSS": null, "GG": null, "TJ": null, "TS": null, "TG": null },
  //   { "districtid": 5, "name": "KASARAGOD", "GK": null, "GSJ": null, "GJ": null, "GS": null, "GSS": null, "GG": null, "TJ": null, "TS": null, "TG": null },
  //   { "districtid": 6, "name": "KOLLAM", "GK": null, "GSJ": null, "GJ": null, "GS": null, "GSS": null, "GG": null, "TJ": null, "TS": null, "TG": null },
  //   { "districtid": 7, "name": "KOTTAYAM", "GK": null, "GSJ": null, "GJ": null, "GS": null, "GSS": null, "GG": null, "TJ": null, "TS": null, "TG": null },
  //   { "districtid": 8, "name": "KOZHIKKODE", "GK": null, "GSJ": null, "GJ": null, "GS": null, "GSS": null, "GG": null, "TJ": null, "TS": null, "TG": null },
  //   { "districtid": 9, "name": "LAKSHADWEEP", "GK": null, "GSJ": null, "GJ": null, "GS": null, "GSS": null, "GG": null, "TJ": null, "TS": null, "TG": null },
  //   { "districtid": 10, "name": "MALAPPURAM EAST", "GK": null, "GSJ": null, "GJ": null, "GS": null, "GSS": null, "GG": null, "TJ": null, "TS": null, "TG": null },
  //   { "districtid": 11, "name": "MALAPPURAM WEST", "GK": null, "GSJ": null, "GJ": null, "GS": null, "GSS": null, "GG": null, "TJ": null, "TS": null, "TG": null },
  //   { "districtid": 12, "name": "PALAKKAD", "GK": null, "GSJ": null, "GJ": null, "GS": null, "GSS": null, "GG": null, "TJ": null, "TS": null, "TG": null },
  //   { "districtid": 13, "name": "THIRUVANANTHAPUARAM", "GK": null, "GSJ": null, "GJ": null, "GS": null, "GSS": null, "GG": null, "TJ": null, "TS": null, "TG": null },
  //   { "districtid": 14, "name": "THRISSUR", "GK": null, "GSJ": null, "GJ": null, "GS": null, "GSS": null, "GG": null, "TJ": null, "TS": null, "TG": null },
  //   { "districtid": 15, "name": "WAYANAD", "GK": null, "GSJ": null, "GJ": null, "GS": null, "GSS": null, "GG": null, "TJ": null, "TS": null, "TG": null },
  //   { "districtid": 16, "name": "NILAGIRI", "GK": null, "GSJ": null, "GJ": null, "GS": null, "GSS": null, "GG": null, "TJ": null, "TS": null, "TG": null }
  // ]

  const districts = [
    { districtid: 1, name: "ALAPPUZHA" },
    { districtid: 2, name: "ERNAKULAM" },
    { districtid: 3, name: "IDUKKI" },
    { districtid: 4, name: "KANNUR" },
    { districtid: 5, name: "KASARAGOD" },
    { districtid: 6, name: "KOLLAM" },
    { districtid: 7, name: "KOTTAYAM" },
    { districtid: 8, name: "KOZHIKKODE" },
    { districtid: 9, name: "LAKSHADWEEP" },
    { districtid: 10, name: "MALAPPURAM EAST" },
    { districtid: 11, name: "MALAPPURAM WEST" },
    { districtid: 12, name: "PALAKKAD" },
    { districtid: 13, name: "THIRUVANANTHAPUARAM" },
    { districtid: 14, name: "THRISSUR" },
    { districtid: 15, name: "WAYANAD" },
    { districtid: 16, name: "NILAGIRI" }
  ]




  documents.forEach(doc => {

    databases.createDocument(databaseId, programsCollectionId, ID.unique(), doc)
      .then(response => {
        console.log('Document created:', response);
      })
      .catch(error => {
        console.error('Error creating document:', error);
      });
  });

}

export const getAllDistrics = async () => {
  try {
    const posts = await databases.listDocuments(
      databaseId,
      districtsCollectionId,
      [Query.orderAsc('name')]
    )

    return posts.documents
  } catch (error) {
    throw new Error(error)
  }
}




export const getItemByItemcode = async (itemcode) => {
  try {

    const program = await databases.listDocuments(
      databaseId,
      programsCollectionId,
      [Query.equal('itemcode', Number(itemcode))]
    )
    if (!program.documents[0]) {
      return false
    } else {
      return program.documents[0]
    }

  } catch (error) {
    console.log(error);
  }
}

export const getAllPrgrams = async () => {
  try {

    const program = await databases.listDocuments(
      databaseId,
      programsCollectionId,
    )
      return program.documents
  
  } catch (error) {
    console.log(error);
  }
}

export const getDistrictScores = async (districtId) => {
  try {

    const districtMark = await databases.listDocuments(
      databaseId,
      districtsCollectionId,
      [Query.equal('districtid', districtId)]
    )
    if (!districtMark.documents[0]) {
      return false
    } else {
      return districtMark.documents[0]
    }

  } catch (error) {
    throw new Error(error)
    console.log(error);
  }
}




export const addNewResult = async (form) => {
  try {
    // const newResult = await account.create(
    //     ID.unique(),
    //     email,
    //     password,
    //     username
    // )

    // if (!newResult) throw Error;

    const {
      itemcode,
      resultimage,
      firstGrade,
      secondGrade,
      thirdGrade,
      adminId,
      publish,
      firstDistrict,
      secondDistrict,
      thirdDistrict,
      firstmark,
      secondmark,
      thirdmark,
     gradesOnly } = form

      // const { category_code } = await getItemByItemcode(itemcode);

    // const districts = {
    //   "G.K": "GK",
    //   "G.S": "GS",
    //   "G.SJ": "GSJ",
    //   "G.J": "GJ",
    //   "G.S": "GS",
    //   "G.SS": "GSS",
    //   "G.G": "GG",
    //   "T.J": "TJ",
    //   "T.S": "TS",
    //   "T.G": "TG"
    // }
    // const category = districts[category_code];

    // const { getFirstdristrictScore } = await getDistrictScores(firstdistrict);

    // const { getSeconddristrictScore } = await getDistrictScores(seconddistrict);

    // const { getThirddristrictScore } = await getDistrictScores(thirddistrict);

    console.log(gradesOnly,"gradeeee");

    const categorycode = await getItemByItemcode(itemcode).then(res => {
      return res.category_code;
    }).catch(error => {
      console.error("Error fetching item:", error);
    });

    const [Image] = await Promise.all([
      uploadFile(resultimage, 'image'),
    ]);

    const newResult = await databases.createDocument(
      databaseId,
      resultsCollectionId,
      ID.unique(),
      {
        resultcode: 1,
        itemcode,
        categorycode: categorycode,
        resultimage: Image,
        firstgrade: firstGrade,
        secondgrade: secondGrade,
        thirdgrade: thirdGrade,
        adminId,
        publish,
        firstdistrict: Number(firstDistrict),
        seconddistrict: Number(secondDistrict),
        thirddistrict: Number(thirdDistrict),
        firstmark,
        secondmark,
        thirdmark,
        gradesonly:gradesOnly
      }
    )

    return newResult
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
}


export const getAllResults = async () => {
  try {
    const posts = await databases.listDocuments(
      databaseId,
      resultsCollectionId,
      [Query.orderDesc('$createdAt'), Query.equal('publish', true)]
    )
    return posts.documents
  } catch (error) {
    throw new Error(error)
  }
}

export const getLatestThreePosts = async () => {
  try {
    const posts = await databases.listDocuments(
      databaseId,
      resultsCollectionId,
      [
        Query.limit(3), // Limit the result to 3 documents
        Query.orderDesc('$createdAt') // Order documents by creation date in descending order
      ]
    )
    return posts.documents // Return the documents
  } catch (error) {
    console.error(error)
  }
}



export const getTotalPointsForDistrict = async (districtId) => {
  try {
    // Fetch all documents
    const posts = await databases.listDocuments(
      databaseId,
      resultsCollectionId,
      [Query.orderDesc('$createdAt')]
    )

    // Filter documents by districtId and calculate the total marks
    let totalPoints = 0;

    // Calculate points for firstdistrict
    posts.documents.forEach(doc => {
      if (doc.firstdistrict === districtId) {
        totalPoints += doc.firstmark; // Add firstmark if firstdistrict matches
      }
      if (doc.seconddistrict === districtId) {
        totalPoints += doc.secondmark; // Add secondmark if seconddistrict matches
      }
      if (doc.thirddistrict === districtId) {
        totalPoints += doc.thirdmark; // Add thirdmark if thirddistrict matches
      }
    });

    // Return the total points for the given district
    //console.log(totalPoints, "hhhhhhhhhhhh");
    return totalPoints;

  } catch (error) {
    throw new Error('Error fetching documents or calculating total points: ' + error.message);
  }
}


export const saveMessage = async ({ name, mobile, message }) => {
  try {
    const newMessage = await databases.createDocument(
      databaseId, messageCollectionId, ID.unique(),
      {
        name: name,
        mobile: mobile,
        message: message
      }
    )
    return newMessage
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
}


export const fetchFileUrl = async (fileId) => {
  try {
    // Make sure fileId is passed correctly
    if (!fileId) {
      throw new Error('Missing required parameter: "fileId"');
    }

    // Assuming storage.getFilePreview is the right method to fetch the preview URL
    const filePreview = await storage.getFilePreview(galleryStorageId, fileId);

    // Return the URL from the file preview
    if (filePreview && filePreview.href) {
      return filePreview.href; // This should be the URL for preview or download
    } else {
      throw new Error('File preview URL not found');
    }
  } catch (error) {
    console.error('Error fetching file URL:', error);
    return null; // Return null in case of error
  }
};


export const getFilesFromBucket = async () => {
  try {
    // Fetch files from the bucket
    const files = await storage.listFiles(galleryStorageId);

    // Map through the files and fetch the preview URL for each one
    const filesWithUrls = await Promise.all(
      files.files.map(async (file) => {

        // Fetch the preview URL for each file using its ID
        const fileUrl = await fetchFileUrl(file.$id); // Pass file.$id here

        return {
          ...file,
          $download: fileUrl, // Add the download URL to the file object
        };
      })
    );

    return filesWithUrls; // Return the list of files with download URLs
  } catch (error) {
    console.error('Error fetching files from bucket:', error);
    return [];
  }
};


export const getResultByItemcode = async (itemcode) => {
  try {

    const result = await databases.listDocuments(
      databaseId,
      resultsCollectionId,
      [Query.equal('itemcode', Number(itemcode))]
    )
    if (!result.documents[0]) {
      return false
    } else {
      return result.documents[0]
    }

  } catch (error) {
    console.log(error);
  }
}



export const updateResult = async (form) => {
  try {
    const {
      resultid,
      itemcode,
      resultimage,
      firstGrade,
      secondGrade,
      thirdGrade,
      adminId,
      publish,
      firstDistrict,
      secondDistrict,
      thirdDistrict,
      firstmark,
      secondmark,
      thirdmark,
      gradesOnly,
    } = form;

    // Fetch the category code for the item
    const categorycode = await getItemByItemcode(itemcode).then((res) => {
      return res.category_code;
    }).catch((error) => {
      console.error("Error fetching item:", error);
    });

    // Upload new result image if provided
    let Image = null;
    if (resultimage) {
      Image = await uploadFile(resultimage, 'image');
    }

    // Prepare the updated document fields
    const updatedResult = {
      itemcode,
      categorycode,
      resultimage: Image || null, // Only update the image if provided
      firstgrade: firstGrade,
      secondgrade: secondGrade,
      thirdgrade: thirdGrade,
      adminId,
      publish,
      firstdistrict: Number(firstDistrict),
      seconddistrict: Number(secondDistrict),
      thirddistrict: Number(thirdDistrict),
      firstmark,
      secondmark,
      thirdmark,
      gradesonly:gradesOnly
    };

    // Remove any `null` values to avoid overwriting with empty fields
    Object.keys(updatedResult).forEach((key) => {
      if (updatedResult[key] === null || updatedResult[key] === undefined) {
        delete updatedResult[key];
      }
    });

    // Update the document in the database
    const result = await databases.updateDocument(
      databaseId,
      resultsCollectionId,
      resultid, // ID of the result document to update
      updatedResult
    );

    return result;
  } catch (error) {
    console.error("Error updating result:", error);
    throw new Error(error);
  }
};

export const getSettings = async (item) => {
  try {
    const status = await databases.listDocuments(
      databaseId,
      settingsCollectionId,
      [Query.equal("name", item)]
    )

    if (!status.documents[0]) {
      return false
    } else {
      return status.documents[0]
    }
  } catch (error) {
    throw new Error(error)
  }
}



export const getAllDownloadFiles = async () => {
  try {
    const posts = await databases.listDocuments(
      databaseId,
      downloadsCollectionId,
      [Query.orderDesc('$createdAt')]
    )

    return posts.documents
  } catch (error) {
    throw new Error(error)
  }
}


// export const createPost = async (form) => {
//   try {
//     const [thumbnailUrl] = await Promise.all([
//       uploadFile(form.thumbnail, 'image'),
//     ]);

//     const newPost = await databases.createDocument(
//       databaseId, postsCollectionID, ID.unique(),
//       {
//         thumbnail: thumbnailUrl,
//         caption: form.caption,
//       }
//     )
//     return newPost
//   } catch (error) {
//     throw new Error(error)
//   }
// }

export const createPost = async (form) => {
  try {
    // Upload all selected images
    const uploadPromises = form.thumbnails.map((image) =>
      uploadFile(image, 'image') // Assuming `uploadFile` handles the file upload
    );

    // Wait for all images to be uploaded
    const uploadedImageUrls = await Promise.all(uploadPromises);

    // Create a new post document in the database with the array of image URLs
    const newPost = await databases.createDocument(
      databaseId,
      postsCollectionID,
      ID.unique(),
      {
        thumbnail: uploadedImageUrls, // Store the array of image URLs
        caption: form.caption,
      }
    );
    return newPost;
  } catch (error) {
    throw new Error(error);
  }
};


export const uploadFilesToGallery = async (files, galleryStorageId) => {
  try {
    if (!Array.isArray(files) || files.length === 0) {
      throw new Error('No files to upload.');
    }

    // Upload each file and collect metadata
    const uploadedFiles = await Promise.all(
      files.map(async (file, index) => {
        const fileName = `gallery_upload_${Date.now()}_${index}_${file.name}`; // Generate a unique file name

        // Upload file to Appwrite bucket
        const uploadedFile = await storage.createFile(galleryStorageId, 'unique()', file, {
          contentType: file.type || 'application/octet-stream', // Use file's MIME type or default
        });

        return uploadedFile; // Return metadata of the uploaded file
      })
    );

    console.log('Files successfully uploaded:', uploadedFiles);
    return uploadedFiles; // Return all uploaded file metadata
  } catch (error) {
    console.error('Error uploading files to Appwrite:', error);
    throw error; // Rethrow the error for further handling
  }
};