import { Alert } from 'react-native';
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
  settingsCollectionId: "67556fe5001614d4bf88",
  downloadsCollectionId: "675585c8000dea692e41",
  galleryStorageId: "674e76b20013b1d3dcb4",
  postsCollectionID: "675713f90017735500fb",
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
        Query.limit(limit),  
        Query.offset(offset) 
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
    Alert.alert('Something went wrong', 'Please check your connection or try again later.');
  }
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
    Alert.alert('Something went wrong', 'Please check your connection or try again later.');
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
    Alert.alert('Something went wrong', 'Please check your connection or try again later.');
  }
}




export const addNewResult = async (form) => {
  try {

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

    const categorycode = await getItemByItemcode(itemcode).then(res => {
      return res.category_code;
    }).catch(error => {
      console.error("Error fetching item:", error);
      Alert.alert('Something went wrong', 'Please check your connection or try again later.');
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
        gradesonly: gradesOnly
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
    Alert.alert('Something went wrong', 'Please check your connection or try again later.');
  }
}


export const getAllResultsAndPostsGrouped = async (page = 1, limit = 10) => {
  try {

    const offset = (page - 1) * limit;

    // Step 1: Fetch Posts with Pagination
    const posts = await databases.listDocuments(
      databaseId,
      postsCollectionID,
      [
        Query.orderDesc('$createdAt'), // Sort by createdAt
        Query.limit(limit),  // Limit the number of posts per page
        Query.offset(offset),  // Skip based on the page number
      ]
    );

    // Step 2: Fetch Results and Add Additional Data
    const results = await databases.listDocuments(
      databaseId,
      resultsCollectionId,
      [
        Query.orderDesc('$createdAt'), // Sort by createdAt
        Query.equal('publish', true), // Only published results
        Query.limit(limit),  // Limit the number of results per page
        Query.offset(offset),  // Skip based on the page number
      ]
    );

    // Fetch additional item details for each result
    const updatedResults = await Promise.all(
      results.documents.map(async (item) => {
        try {
          const { itemlabel, category_code } = await getItemByItemcode(item.itemcode);
          return {
            ...item,
            itemlabel,
            category_code,
            type: 'result', // Tagging as result
          };
        } catch (error) {
          console.error(`Error fetching details for item_code ${item.itemcode}:`, error);
          return { ...item, type: 'result' }; // Return the item as is if error occurs
        }
      })
    );

    // Step 3: Group results and posts together, tagged by type (post/result)
    const allItems = [
      ...posts.documents.map((post) => ({ ...post, type: 'post' })),
      ...updatedResults, // Already tagged as 'result' in the previous map
    ];

    // Step 4: Sort all items by createdAt
    const sortedItems = allItems.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Step 5: Return the grouped and sorted result
    return sortedItems;

  } catch (error) {
    console.error('Error fetching results and posts:', error);
    Alert.alert('Something went wrong', 'Please check your connection or try again later.');
  }
};




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


    return totalPoints;

  } catch (error) {
    Alert.alert('Something went wrong', 'Please check your connection or try again later.');
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
    Alert.alert('Something went wrong', 'Please check your connection or try again later.');
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
    Alert.alert('Something went wrong', 'Please check your connection or try again later.');
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
      gradesonly: gradesOnly
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
    Alert.alert('Something went wrong', 'Please check your connection or try again later.');
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
    Alert.alert('Something went wrong', 'Please check your connection or try again later.');
  }
}



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