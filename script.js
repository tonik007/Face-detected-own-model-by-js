// const imageUpload = document.getElementById('imageUpload');
// const status = document.getElementById('status');
// const imageContainer = document.getElementById('imageContainer');

// Promise.all([
//   faceapi.nets.tinyFaceDetector.loadFromUri('models'),
//   faceapi.nets.faceLandmark68Net.loadFromUri('models'),
//   faceapi.nets.faceRecognitionNet.loadFromUri('models'),
//   faceapi.nets.ssdMobilenetv1.loadFromUri('models')
// ]).then(() => {
//   status.innerText = "✅ Models loaded. Upload your image.";
// }).catch(err => {
//   status.innerText = "❌ Model load failed";
//   console.error(err);
// });

// imageUpload.addEventListener('change', async () => {
//   const imageFile = imageUpload.files[0];
//   if (!imageFile) return;
  
  

//   const image = await faceapi.bufferToImage(imageFile);

//   imageContainer.innerHTML = '';
//   status.innerText = '🔍 Detecting...';
//   imageContainer.appendChild(image);

//   const canvas = faceapi.createCanvasFromMedia(image);
//   imageContainer.appendChild(canvas);
//   const displaySize = { width: image.width, height: image.height };
//   faceapi.matchDimensions(canvas, displaySize);

//   const labeledDescriptors = await loadLabeledImages();
//   const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.6);

//   const detections = await faceapi
//     .detectAllFaces(image)
//     .withFaceLandmarks()
//     .withFaceDescriptors();

//   if (!detections.length) {
//     status.innerText = "😕 No face detected.";
//     return;
//   }

//   const resized = faceapi.resizeResults(detections, displaySize);
//   const results = resized.map(d => faceMatcher.findBestMatch(d.descriptor));

//   results.forEach((result, i) => {
//     const box = resized[i].detection.box;
//     const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() });
//     drawBox.draw(canvas);

//     if (!result.label.includes('unknown')) {
//       status.innerText = `✅ Image person Named ${result.label}`;
//     } else {
//       status.innerText = '🚫 Unknown Face';
//     }
//   });
// });

// function loadLabeledImages() {
//   const labels = ['Tonik', 'Cristiano Rolando']; // ফোল্ডার নাম
//   return Promise.all(
//     labels.map(async label => {
//       const descriptions = [];
//       for (let i = 1; i <= 2; i++) {
//         const imgPath = `labeled_images/${label}/${i}.jpg`;
//         try {
//           const img = await faceapi.fetchImage(imgPath);
//           const detection = await faceapi
//             .detectSingleFace(img)
//             .withFaceLandmarks()
//             .withFaceDescriptor();
//           if (detection) {
//             descriptions.push(detection.descriptor);
//           } else {
//             console.warn(`No face found in ${imgPath}`);
//           }
//         } catch (err) {
//           console.error(`Failed to load ${imgPath}:`, err);
//         }
//       }
//       return new faceapi.LabeledFaceDescriptors(label, descriptions);
//     })
//   );
// }


const imageUpload = document.getElementById('imageUpload');
const status = document.getElementById('status');
const imageContainer = document.getElementById('imageContainer');

// মডেল লোড
async function loadModels() {
  try {
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri('models'),
      faceapi.nets.faceLandmark68Net.loadFromUri('models'),
      faceapi.nets.faceRecognitionNet.loadFromUri('models'),
      faceapi.nets.ssdMobilenetv1.loadFromUri('models'),
    ]);
    status.innerText = "✅ Models loaded. Upload your image.";
  } catch (error) {
    status.innerText = "❌ Model load failed";
    console.error(error);
  }
}

// ছবি আপলোড ইভেন্ট হ্যান্ডলার
async function onImageUpload() {
  const imageFile = imageUpload.files[0];
  if (!imageFile) return;

  // আগের ছবি ও ক্যানভাস মুছে ফেল
  imageContainer.innerHTML = '';
  status.innerText = '⏳ Loading image...';

  try {
    // ফাইল থেকে image element বানাও
    const image = await faceapi.bufferToImage(imageFile);

    // ম্যাক্স সাইজ সেটিংস
    const MAX_WIDTH = 600;
    const MAX_HEIGHT = 450;

    let width = image.width;
    let height = image.height;

    // aspect ratio ধরে রেখে সাইজ কমাও যদি বড় হয়
    if (width > MAX_WIDTH || height > MAX_HEIGHT) {
      const widthRatio = MAX_WIDTH / width;
      const heightRatio = MAX_HEIGHT / height;
      const scale = Math.min(widthRatio, heightRatio);
      width = width * scale;
      height = height * scale;
    }

    // নতুন সাইজ image element এ সেট করো
    image.width = width;
    image.height = height;

    imageContainer.appendChild(image);

    // canvas তৈরি করো ও container এ যোগ করো
    const canvas = faceapi.createCanvasFromMedia(image);
    imageContainer.appendChild(canvas);

    // canvas ও display size মিলিয়ে দাও
    const displaySize = { width, height };
    faceapi.matchDimensions(canvas, displaySize);

    status.innerText = '🔍 Detecting faces...';

    // লেবেল্ড ইমেজ লোড করো
    const labeledDescriptors = await loadLabeledImages();
    const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.6);

    // detection করো
    const detections = await faceapi
      .detectAllFaces(image)
      .withFaceLandmarks()
      .withFaceDescriptors();

    if (!detections.length) {
      status.innerText = "😕 No face detected.";
      return;
    }

    // detect গুলো স্কেল করো display size অনুযায়ী
    const resizedDetections = faceapi.resizeResults(detections, displaySize);

    // ম্যাচ খুঁজে বের করো
    const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor));

    // detect box ও লেবেল ড্র করো
    results.forEach((result, i) => {
      const box = resizedDetections[i].detection.box;
      const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() });
      drawBox.draw(canvas);

      if (!result.label.includes('unknown')) {
        status.innerText = `✅ Image person Named ${result.label}`;
      } else {
        status.innerText = '🚫 Unknown Face';
      }
    });

  } catch (error) {
    status.innerText = '❌ Error processing image';
    console.error(error);
  }
}

// লেবেল্ড ইমেজ লোডার ফাংশন
async function loadLabeledImages() {
  const labels = ['Tonik', 'Cristiano Rolando', 'Mohsin']; // তোমার লেবেল্ড ফোল্ডারের নামগুলো
  return Promise.all(
    labels.map(async label => {
      const descriptions = [];
      for (let i = 1; i <= 2; i++) {
        const imgPath = `labeled_images/${label}/${i}.jpg`;
        try {
          const img = await faceapi.fetchImage(imgPath);
          const detection = await faceapi
            .detectSingleFace(img)
            .withFaceLandmarks()
            .withFaceDescriptor();

          if (detection) {
            descriptions.push(detection.descriptor);
          } else {
            console.warn(`No face found in ${imgPath}`);
          }
        } catch (error) {
          console.error(`Failed to load ${imgPath}`, error);
        }
      }
      return new faceapi.LabeledFaceDescriptors(label, descriptions);
    })
  );
}

// মডেল লোড হয়ে গেলে ছবি আপলোডের listener সেট করো
loadModels().then(() => {
  imageUpload.addEventListener('change', onImageUpload);
});

