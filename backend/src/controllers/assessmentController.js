// import Assessment from "../models/assessmentModel.js";
// import asyncHandler from 'express-async-handler';
// import puppeteer from 'puppeteer';
// import fetch from "node-fetch";
// // Save a new assessment
// export const saveAssessment = async (req, res) => {
//   try {
//     const {
//       name,
//       dwellers,
//       phone,
//       email,
//       roofArea,
//       openSpace,
//       roofType,
//       soilType,
//       address,
//       state,
//       district,
//       latitude,
//       longitude,
//       rainfall,
//     } = req.body;

//     const newAssessment = new Assessment({
//       user: req.user._id, // from auth middleware
//       name,
//       dwellers,
//       phone,
//       email,
//       roofArea,
//       openSpace,
//       roofType,
//       soilType,
//       address,
//       state,
//       district,
//       latitude,
//       longitude,
//       rainfall,
//     });

//     const saved = await newAssessment.save();
//     res.status(201).json(saved);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // Get latest assessment
// // export const getLatestAssessment = async (req, res) => {
// //   try {
// //     const latest = await Assessment.findOne({ user: req.user._id })
// //       .sort({ createdAt: -1 });

// //     if (!latest) {
// //       return res.status(404).json({ message: "No assessments found" });
// //     }

// //     res.json(latest);
// //   } catch (err) {
// //     res.status(500).json({ message: err.message });
// //   }
// // };

// export const getLatestAssessment = async (req, res) => {
//   try {
//     const userId = req.user.id; // from auth middleware

//     // 1. Get latest assessment from MongoDB
//     const latest = await Assessment.findOne({ user: userId }).sort({ createdAt: -1 });

//     if (!latest) {
//       return res.status(404).json({ message: "No assessment found" });
//     }
//     const mlurl = process.env.ML_SERVICE_URL;
//     // 2. Send data to Python API
//     const pyRes = await fetch(`${mlurl}/calculate`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         roof_area: latest.roofArea,
//         roof_type: latest.roofType,
//         soil_type: latest.soilType,
//         annual_rainfall: latest.annualRainfall,
//       }),
//     });

//     const pyData = await pyRes.json();

//     // 3. Merge MongoDB data + Python calculation
//     res.json({
//       ...latest.toObject(),
//       potentialHarvest: pyData.potentialHarvest,
//     });

//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

import Assessment from "../models/assessmentModel.js";
import asyncHandler from 'express-async-handler';
import puppeteer from 'puppeteer';
import fetch from "node-fetch";

// Save a new assessment
export const saveAssessment = asyncHandler(async (req, res) => {
  const {
    name,
    dwellers,
    phone,
    email,
    roofArea,
    openSpace,
    roofType,
    soilType,
    address,
    state,
    district,
    latitude,
    longitude,
    rainfall,
  } = req.body;

  const newAssessment = new Assessment({
    user: req.user._id, // from auth middleware
    name,
    dwellers,
    phone,
    email,
    roofArea,
    openSpace,
    roofType,
    soilType,
    address,
    state,
    district,
    latitude,
    longitude,
    rainfall,
  });

  const saved = await newAssessment.save();
  res.status(201).json(saved);
});

// Get latest assessment
export const getLatestAssessment = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  let latest = await Assessment.findOne({ user: userId }).sort({ createdAt: -1 });

  if (!latest) {
    res.status(404);
    throw new Error("No assessment found");
  }

  const mlurl = process.env.ML_SERVICE_URL;
  const pyRes = await fetch(`${mlurl}/calculate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      roof_area: latest.roofArea,
      roof_type: latest.roofType,
      soil_type: latest.soilType,
      annual_rainfall: latest.rainfall,
    }),
  });

  if (!pyRes.ok) {
    throw new Error(`Python API responded with status: ${pyRes.status}`);
  }

  const pyData = await pyRes.json();

  // ✅ Save ML results back into MongoDB
  latest.recommendedStructures = pyData.recommended_structures || [];
  latest.costEstimation = pyData.cost_estimation || {};
  latest.roi = pyData.roi || {};
  latest.feasibility = pyData.feasibility || "Unknown";
  latest.potentialHarvest = pyData.potential_harvest || 0;
  latest.feasibilityDescription = pyData.feasibility_description || "";
  latest.rainfallDistribution = pyData.rainfall_distribution || [];
  latest.groundwaterLevel = pyData.groundwater_level || 0;
  latest.tankVolume = pyData.tank_volume || 0;
  latest.efficiency = pyData.efficiency || 0;
  latest.inertia = pyData.inertia || 0;
  latest.aquiferInfo = pyData.aquifer_info || null;
  latest.currency = pyData.currency || 'INR';
  latest.modelVersion = pyData.model_version || 'ML_trained_indian_data';

  await latest.save();

  res.json(latest);
  console.log(latest);
});

export const generateAllPdf = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // 1. Get all assessments from DB for the user
  const assessments = await Assessment.find({ user: userId }).sort({ createdAt: -1 });
  if (!assessments || assessments.length === 0) {
    return res.status(404).json({ message: 'No assessments found to generate PDF' });
  }

  // 2. Generate combined HTML content
  let combinedHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>All Assessment Reports</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1, h2 { color: #333; }
        .assessment { page-break-after: always; }
        ul { margin-left: 20px; }
      </style>
    </head>
    <body>
      <h1>All Assessment Reports for ${req.user.name || 'User'}</h1>
  `;

  for (const assessment of assessments) {
    const fullReport = assessment.toObject();

    combinedHtml += `
      <div class="assessment">
        <h2>Assessment Report for ${fullReport.name || 'User'}</h2>
        <p><strong>Date:</strong> ${new Date(fullReport.createdAt).toLocaleDateString()}</p>
        <p><strong>Feasibility:</strong> ${fullReport.feasibility || 'N/A'}</p>
        <p><strong>Feasibility Description:</strong> ${fullReport.feasibilityDescription || 'N/A'}</p>
        <p><strong>Potential Harvest:</strong> ${fullReport.potentialHarvest || 'N/A'} liters/year</p>
        <p><strong>Tank Volume:</strong> ${fullReport.tankVolume || 'N/A'} liters</p>
        <p><strong>Efficiency:</strong> ${fullReport.efficiency || 'N/A'}%</p>
        <p><strong>Inertia:</strong> ${fullReport.inertia || 'N/A'}</p>
        <p><strong>Groundwater Level:</strong> ${fullReport.groundwaterLevel || 'N/A'} meters</p>

        <h3>Details</h3>
        <ul>
          <li><strong>Dwellers:</strong> ${fullReport.dwellers || 'N/A'}</li>
          <li><strong>Roof Area:</strong> ${fullReport.roofArea || 'N/A'} m²</li>
          <li><strong>Open Space:</strong> ${fullReport.openSpace || 'N/A'} m²</li>
          <li><strong>Roof Type:</strong> ${fullReport.roofType || 'N/A'}</li>
          <li><strong>Soil Type:</strong> ${fullReport.soilType || 'N/A'}</li>
          <li><strong>Annual Rainfall:</strong> ${fullReport.rainfall || 'N/A'} mm</li>
          <li><strong>Address:</strong> ${fullReport.address || 'N/A'}, ${fullReport.district || 'N/A'}, ${fullReport.state || 'N/A'}</li>
          <li><strong>Coordinates:</strong> ${fullReport.latitude || 'N/A'}, ${fullReport.longitude || 'N/A'}</li>
          <li><strong>Contact:</strong> ${fullReport.phone || 'N/A'}, ${fullReport.email || 'N/A'}</li>
        </ul>

        <h3>Recommended Structures</h3>
        <ul>
          ${(fullReport.recommendedStructures || []).map(s => `<li>${s.name}: ${s.description}</li>`).join('')}
        </ul>

        <h3>Rainfall Distribution (monthly)</h3>
        <ul>
          ${(fullReport.rainfallDistribution || []).map((r, i) => `<li>Month ${i+1}: ${r} mm</li>`).join('')}
        </ul>

        <h3>Cost Estimation (${fullReport.currency || 'INR'})</h3>
        <ul>
          <li><strong>Storage Tank:</strong> ${fullReport.costEstimation.storageTank || '0'}</li>
          <li><strong>Recharge Pit:</strong> ${fullReport.costEstimation.rechargePit || '0'}</li>
          <li><strong>Gutters/Pipes:</strong> ${fullReport.costEstimation.guttersPipes || '0'}</li>
          <li><strong>Filtration System:</strong> ${fullReport.costEstimation.filtrationSystem || '0'}</li>
          <li><strong>Installation:</strong> ${fullReport.costEstimation.installation || '0'}</li>
          <li><strong>Total:</strong> ${fullReport.costEstimation.total || '0'}</li>
        </ul>

        <h3>Return on Investment (ROI)</h3>
        <ul>
          <li><strong>Annual Savings:</strong> ${fullReport.roi.annualSavings || '0'}</li>
          <li><strong>Payback Period:</strong> ${fullReport.roi.paybackPeriod || 'N/A'}</li>
          <li><strong>Water Saved:</strong> ${fullReport.roi.waterSaved || '0'}</li>
          <li><strong>Runoff Reduction:</strong> ${fullReport.roi.runoffReduction || '0%'}</li>
        </ul>

        <h3>Aquifer Information</h3>
        <p><strong>Nearest Aquifer:</strong> ${fullReport.aquiferInfo?.nearest_aquifer?.name || 'N/A'}</p>
        <p><strong>Distance:</strong> ${fullReport.aquiferInfo?.distance_km || 'N/A'} km</p>
        <p><strong>Type:</strong> ${fullReport.aquiferInfo?.aquifer_type || 'N/A'}</p>
        <p><strong>Recharge Potential:</strong> ${fullReport.aquiferInfo?.recharge_potential || 'N/A'}</p>

        <p><em>Model Version: ${fullReport.modelVersion || 'N/A'}</em></p>
      </div>
    `;
  }

  combinedHtml += `
    </body>
    </html>
  `;

  // 3. Generate PDF from merged data
  let browser;
  try {
    browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setContent(combinedHtml, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=all_assessments_report.pdf`);
    res.setHeader('Content-Length', pdfBuffer.length);

    return res.end(pdfBuffer);
  } catch (error) {
    if (browser) await browser.close();
    console.error(`[PDF] Error: ${error.message}`);
    return res.status(500).json({ message: 'Failed to generate PDF' });
  }
});

export const generatePdf = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  // 1. Get assessment from DB
  const assessment = await Assessment.findOne({ _id: id, user: userId });
  if (!assessment) {
    return res.status(404).json({ message: 'Assessment report not found' });
  }

  // 2. Use DB data directly (don’t call ML again)
  const fullReport = assessment.toObject();

  // 3. Generate PDF from MongoDB data
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Assessment Report</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1, h2 { color: #333; }
        ul { margin-left: 20px; }
      </style>
    </head>
    <body>
      <h1>Assessment Report for ${fullReport.name || 'User'}</h1>
      <p><strong>Date:</strong> ${new Date(fullReport.createdAt).toLocaleDateString()}</p>
      <p><strong>Feasibility:</strong> ${fullReport.feasibility || 'N/A'}</p>
      <p><strong>Feasibility Description:</strong> ${fullReport.feasibilityDescription || 'N/A'}</p>
      <p><strong>Potential Harvest:</strong> ${fullReport.potentialHarvest || 'N/A'} liters/year</p>
      <p><strong>Tank Volume:</strong> ${fullReport.tankVolume || 'N/A'} liters</p>
      <p><strong>Efficiency:</strong> ${fullReport.efficiency || 'N/A'}%</p>
      <p><strong>Inertia:</strong> ${fullReport.inertia || 'N/A'}</p>
      <p><strong>Groundwater Level:</strong> ${fullReport.groundwaterLevel || 'N/A'} meters</p>

      <h2>Details</h2>
      <ul>
        <li>Roof Area: ${fullReport.roofArea || 'N/A'} m²</li>
        <li>Roof Type: ${fullReport.roofType || 'N/A'}</li>
        <li>Soil Type: ${fullReport.soilType || 'N/A'}</li>
        <li>Annual Rainfall: ${fullReport.rainfall || 'N/A'} mm</li>
        <li>Address: ${fullReport.address || 'N/A'}, ${fullReport.district || 'N/A'}, ${fullReport.state || 'N/A'}</li>
        <li>Contact: ${fullReport.phone || 'N/A'}, ${fullReport.email || 'N/A'}</li>
      </ul>

      <h2>Recommended Structures</h2>
      <ul>
        ${(fullReport.recommendedStructures || [])
          .map(s => `<li><strong>${s.name}</strong>: ${s.description}</li>`)
          .join('')}
      </ul>

      <h2>Cost Estimation (${fullReport.currency || 'INR'})</h2>
      <ul>
        <li>Storage Tank: ₹${fullReport.costEstimation?.storageTank || '0'}</li>
        <li>Recharge Pit: ₹${fullReport.costEstimation?.rechargePit || '0'}</li>
        <li>Gutters/Pipes: ₹${fullReport.costEstimation?.guttersPipes || '0'}</li>
        <li>Filtration System: ₹${fullReport.costEstimation?.filtrationSystem || '0'}</li>
        <li>Installation: ₹${fullReport.costEstimation?.installation || '0'}</li>
        <li><strong>Total:</strong> ₹${fullReport.costEstimation?.total || '0'}</li>
      </ul>

      <h2>Return on Investment (ROI)</h2>
      <ul>
        <li>Annual Savings: ₹${fullReport.roi?.annualSavings || '0'}</li>
        <li>Payback Period: ${fullReport.roi?.paybackPeriod || 'N/A'}</li>
        <li>Water Saved: ${fullReport.roi?.waterSaved || '0'}</li>
        <li>Runoff Reduction: ${fullReport.roi?.runoffReduction || '0%'}</li>
      </ul>

      <h2>Aquifer Information</h2>
      <p><strong>Nearest Aquifer:</strong> ${fullReport.aquiferInfo?.nearest_aquifer?.name || 'N/A'}</p>
      <p><strong>Distance:</strong> ${fullReport.aquiferInfo?.distance_km || 'N/A'} km</p>
      <p><strong>Type:</strong> ${fullReport.aquiferInfo?.aquifer_type || 'N/A'}</p>
      <p><strong>Recharge Potential:</strong> ${fullReport.aquiferInfo?.recharge_potential || 'N/A'}</p>
    </body>
    </html>
  `;

  let browser;
  try {
    browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=assessment_report_${id}.pdf`);
    res.setHeader('Content-Length', pdfBuffer.length);

    return res.end(pdfBuffer);
  } catch (error) {
    if (browser) await browser.close();
    console.error(`[PDF] Error: ${error.message}`);
    return res.status(500).json({ message: 'Failed to generate PDF' });
  }
});
