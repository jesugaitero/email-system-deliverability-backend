const express = require("express");

const router = express.Router();

const {
  register,
  login,
  logout,
  currentUser,
  createLinodeServer,
  getLinodeServers,
  deployLinodeServer,
  deleteLinodeServer,
  parseCSV,
  createTemplate,
  uploadServiceImages,
  updateLinodeSettings,
  getLinodeSettings,
  getTemplates,
  deleteTemplate,
  getEmailSettings,
  getTemplate,
  deleteBitlaunchServer,
  updateAllBitlaunch,
  getBitlaunchRegions,
  getBitLaunchServers,
  installPackagesBitlaunch,
  updateBitLaunchSettings,
  getBitLaunchSettings,
  deployBitLaunchServer,
  updateTemplate,
  updateEmailSettings,
  sendEmail,
  requestEmailProcessor,
  updateAllLinodes,
  updateVultrSettings,
  updateAllVultr,
  getVultrSettings,
  getVultrServers,
  getVultrRegions,
  deleteVultrServer,
  installPackages,
  getLinodeRegions,
  saveEmailResults,
  createCustomServer,
  getCustomServers,
  deleteCustomServer,
  installPackagesCustom,
  getDigitalOceanSettings,
  updateDigitalOceanSettings,
  updateAllDigitalOcean,
  getDigitalOceanServers,
  getDigitalOceanRegions,
  deployDigitalOceanServer,
  deployVultrServer,
  deleteDigitalOceanServer,
} = require("../controllers/auth.js");

router.post("/register", register);

router.post("/login", login);

router.get("/logout", logout);

router.get("/current-user", currentUser);

router.post("/send-email", uploadServiceImages, parseCSV, sendEmail);

router.post(
  "/send-email-server",
  uploadServiceImages,
  parseCSV,
  requestEmailProcessor
);

router.get("/email-templates", getTemplates);

router.get("/current-template/:id", getTemplate);

router.get("/email-settings", getEmailSettings);

router.put("/update-email-settings", updateEmailSettings);

router.post("/create-template", createTemplate);

router.put("/email-templates/:id", deleteTemplate);

router.put("/update-template", updateTemplate);


router.post("/update-bitlaunch-settings", updateBitLaunchSettings);

router.post("/update-vultr-settings", updateVultrSettings);

router.post("/update-digital-settings", updateDigitalOceanSettings);


router.get("/update-bitlaunch", updateAllBitlaunch);
router.get("/update-vultr", updateAllVultr);

router.get("/update-digital", updateAllDigitalOcean);


router.get("/bitlaunch-settings", getBitLaunchSettings);

router.get("/vultr-settings", getVultrSettings);

router.get("/digital-settings", getDigitalOceanSettings);



router.get("/get-bitlaunch-servers", getBitLaunchServers);

router.get("/get-custom-servers", getCustomServers);
router.get("/get-vultr-servers", getVultrServers);

router.get("/get-digital-servers", getDigitalOceanServers);


router.get("/get-bitlaunch-regions", getBitlaunchRegions);
router.get("/get-vultr-regions", getVultrRegions);

router.get("/get-digital-regions", getDigitalOceanRegions);


router.put("/delete-server-bitlaunch/:id", deleteBitlaunchServer);

router.put("/delete-server-custom/:id", deleteCustomServer);

router.put("/delete-server-vultr/:id", deleteVultrServer);

router.put("/delete-server-digital/:id", deleteDigitalOceanServer);

router.post("/install-packages/:id", installPackages);

router.post("/install-packages-custom/:id", installPackagesCustom);

router.post("/install-packages-bitlaunch/:id", installPackagesBitlaunch);


router.post("/deploy-server-bitlaunch", deployBitLaunchServer);

router.post("/deploy-server-digital", deployDigitalOceanServer);

router.post("/deploy-server-vultr", deployVultrServer);

router.post("/save-email-result", saveEmailResults);

router.post("/create-custom-server", createCustomServer);


router.get("/get-linode-regions", getLinodeRegions);
router.post("/update-linode-settings", updateLinodeSettings);
router.post("/deploy-server", deployLinodeServer);
router.post("/create-linode-server", createLinodeServer);
router.get("/get-linode-servers", getLinodeServers);
router.get("/update-linodes", updateAllLinodes);
router.get("/linode-settings", getLinodeSettings);
router.put("/delete-server/:id", deleteLinodeServer);

module.exports = router;
