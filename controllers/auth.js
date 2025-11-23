const User = require("../models/user");
//SETTINGS
const EmailTemplate = require("../models/emailTemplate");
const EmailSettings = require("../models/emailSettings");
const LinodeSettings = require("../models/linodeSettings");
const BitlauchSettings = require("../models/bitlaunchSettings");
const VultrSettings = require("../models/vultrSettings");
const DigitalOceanSettings = require("../models/digitalOceanSettings");
//SERVERS
const LinodeServers = require("../models/LinodeServers");
const VultrServers = require("../models/VultrServers");
const DigitalOceanServers = require("../models/DigitalOceanServers");
const BitLaunchServers = require("../models/BitLaunchServers");
// const BitLaunchServers = require('../models/BitLaunchServers');
const CustomServers = require("../models/CustomServers");
//EMAILS SENT
const emailQueue = require("../models/EmailsQueue");
const EmailSended = require("../models/emailsSended");
//CONFIG PACKAGES
 import { v4 as uuidv4 } from 'uuid';
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const pug = require("pug");
const htmlToText = require("html-to-text");
const multer = require("multer");
const email = require("../utils/email");
const axios = require("axios");
const _ = require("lodash");
var Fakerator = require("fakerator");
var fakerator = Fakerator("de-DE");
const fs = require("fs");
const path = require("path");
const csv = require("fast-csv");
const { NodeSSH } = require("node-ssh");

const { hashPassword, comparePassword } = require("../utils/auth");

// const storage = multer.memoryStorage();
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    //console.log('eeeeeeeeeeeee');
    cb(null, "./assets");
  },
  filename: (req, file, cb) => {
    //user-id-timestamp.extension
    // const ext = file.mimetype.split('/')[1];
    const ext = file.originalname.split(".")[1];
    //console.log('aaaaa');
    // cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
    cb(null, `parse.${ext}`);
  },
});

const multerFilter = (req, file, cb) => {
  //// console.log(file);
  // if (file.mimetype.startsWith('image')) {
  if (file.mimetype.startsWith("application")) {
    cb(null, true);
  } else {
    //cb(console.log('error, its not a csv'), false);
  }
};

const upload = multer({
  storage: multerStorage,
  // storage: storage,

  fileFilter: multerFilter,
});

const installProcessOnServer = async (server, model) => {
  console.log("new install");
  console.log(server.serverInfo.status);
  try {
    const ssh = new NodeSSH();
    const shit = await ssh
      .connect({
        host: server.serverInfo.ipv4[0],
        username: "root",
        password: "aComplexP@ssword!",
      })
      .then(async function () {
        console.log("installing git");
        ssh
          .execCommand("sudo yum install git -y", { cwd: "/" })
          .then(async function (result) {
            ////// console.log(result)
            ////console.log('1')
            const updatedServer = await model.findOneAndUpdate(
              { _id: server._id },
              { $set: { softwareVersion: "Installing software" } }
            );
            if (result.stdout) {
              console.log("STDOUT: " + result.stdout);
            }
            //console.log('STDERR: ' + result.stderr)
            if (result.stderr) {
              console.log("STDERR: " + result.stderr);
            }
          })

          .then(async function () {
            ssh
              .execCommand("mkdir app", { cwd: "/" })
              .then(function (result) {
                console.log("making the app folder");
                if (result.stdout) {
                  console.log("STDOUT: " + result.stdout);
                }
                //console.log('STDERR: ' + result.stderr)
                if (result.stderr) {
                  console.log("STDERR: " + result.stderr);
                }
              })
              .then(async function () {
                //probably we need to change Version of node
                ssh
                  .execCommand(
                    "curl -sL https://rpm.nodesource.com/setup_18.x | sudo bash -",
                    { cwd: "/" }
                  )
                  .then(function (result) {
                    console.log("downloading and setting up nodejs");
                    if (result.stdout) {
                      console.log("STDOUT: " + result.stdout);
                    }
                    //console.log('STDERR: ' + result.stderr)
                    if (result.stderr) {
                      console.log("STDERR: " + result.stderr);
                    }
                  })
                  .then(async function () {
                    ssh
                      .execCommand("sudo yum install nodejs --skip-broken rpm -Va --nofiles --nodigest -y", { cwd: "/" })
                      .then(function (result) {
                        if (result.stdout) {
                          console.log("STDOUT: " + result.stdout);
                        }
                        //console.log('STDERR: ' + result.stderr)
                        if (result.stderr) {
                          console.log("STDERR: " + result.stderr);
                        }
                      })
                      .then(async function () {
                        ssh
                          .execCommand(
                            'git clone https://github.com/jesus-m-awsh/Email-Service.git',
                            { cwd: "/app" }
                          )
                          .then(function (result) {
                            console.log("cloning the repo");
                            if (result.stdout) {
                              console.log("STDOUT: " + result.stdout);
                            }
                            //console.log('STDERR: ' + result.stderr)
                            if (result.stderr) {
                              console.log("STDERR: " + result.stderr);
                            }
                          })
                          .then(async function () {
                            ssh
                              .execCommand("npm i", {
                                cwd: "/app/Email-Service",
                              })
                              .then(function (result) {
                                console.log("installing dependencies on app");
                                if (result.stdout) {
                                  console.log("STDOUT: " + result.stdout);
                                }
                                //console.log('STDERR: ' + result.stderr)
                                if (result.stderr) {
                                  console.log("STDERR: " + result.stderr);
                                }
                              })
                              .then(async function () {
                                ssh
                                  .execCommand(
                                    "firewall-cmd --permanent --zone=public --add-port=8001/tcp",
                                    { cwd: "/" }
                                  )
                                  .then(function (result) {
                                    console.log("setting up the firewall");
                                    if (result.stdout) {
                                      console.log("STDOUT: " + result.stdout);
                                    }
                                    //console.log('STDERR: ' + result.stderr)
                                    if (result.stderr) {
                                      console.log("STDERR: " + result.stderr);
                                    }
                                  })
                                  .then(async function () {
                                    ssh
                                      .execCommand(
                                        "systemctl restart firewalld ",
                                        { cwd: "/" }
                                      )
                                      .then(function (result) {
                                        console.log("setting up firewall");
                                        if (result.stdout) {
                                          console.log(
                                            "STDOUT: " + result.stdout
                                          );
                                        }
                                        //console.log('STDERR: ' + result.stderr)
                                        if (result.stderr) {
                                          console.log(
                                            "STDERR: " + result.stderr
                                          );
                                        }
                                      })
                                      .then(async function () {
                                        ssh
                                          .execCommand(
                                            "mv /app/Email-Service/install/systemd_install /etc/systemd/system/emailer.service ",
                                            { cwd: "/" }
                                          )
                                          .then(function (result) {
                                            console.log("moving the app to another directory");
                                            if (result.stdout) {
                                              console.log(
                                                "STDOUT: " + result.stdout
                                              );
                                            }
                                            //console.log('STDERR: ' + result.stderr)
                                            if (result.stderr) {
                                              console.log(
                                                "STDERR: " + result.stderr
                                              );
                                            }
                                          })
                                          .then(async function () {
                                            ssh
                                              .execCommand(
                                                "systemctl enable emailer.service",
                                                { cwd: "/" }
                                              )
                                              .then(function (result) {
                                                ////console.log(result)
                                                //////console.log('7')
                                                if (result.stdout) {
                                                  console.log(
                                                    "STDOUT: " + result.stdout
                                                  );
                                                }
                                                //console.log('STDERR: ' + result.stderr)
                                                if (result.stderr) {
                                                  console.log(
                                                    "STDERR: " + result.stderr
                                                  );
                                                }
                                              })
                                              .then(async function () {
                                                ssh
                                                  .execCommand(
                                                    "systemctl start emailer.service",
                                                    { cwd: "/" }
                                                  )
                                                  .then(function (result) {
                                                    ////console.log(result)
                                                    //////console.log('7')
                                                    if (result.stdout) {
                                                      console.log(
                                                        "STDOUT: " +
                                                          result.stdout
                                                      );
                                                    }
                                                    //console.log('STDERR: ' + result.stderr)
                                                    if (result.stderr) {
                                                      console.log(
                                                        "STDERR: " +
                                                          result.stderr
                                                      );
                                                    }
                                                  })
                                                  .then(async function () {
                                                    ssh
                                                      .execCommand(
                                                        "npm -s run env echo '$npm_package_version'",
                                                        {
                                                          cwd: "/app/Email-Service",
                                                        }
                                                      )
                                                      .then(async function (
                                                        result
                                                      ) {
                                                        if (result.stdout) {
                                                          console.log(
                                                            "STDOUT: " +
                                                              result.stdout
                                                          );
                                                        }
                                                        //console.log('STDERR: ' + result.stderr)
                                                        if (result.stderr) {
                                                          console.log(
                                                            "STDERR: " +
                                                              result.stderr
                                                          );
                                                        }
                                                        console.log("q??");
                                                        console.log(
                                                          result.stdout
                                                        );
                                                        const updatedServer =
                                                          await model.findOneAndUpdate(
                                                            { _id: server._id },
                                                            {
                                                              $set: {
                                                                softwareVersion:
                                                                  result.stdout,
                                                              },
                                                            }
                                                          );
                                                        //console.log(updatedServer)
                                                        //console.log('ITS THE FINAL COUNTDOWN TIRURIRU')
                                                        // res.status(200).send('Success');
                                                      })
                                                      .then(async function () {
                                                        ssh
                                                          .execCommand(
                                                            "sudo yum install postfix",
                                                            { cwd: "/" }
                                                          )
                                                          .then(async function (
                                                            result
                                                          ) {
                                                            if (result.stdout) {
                                                              console.log(
                                                                "STDOUT: " +
                                                                  result.stdout
                                                              );
                                                            }
                                                            //console.log('STDERR: ' + result.stderr)
                                                            if (result.stderr) {
                                                              console.log(
                                                                "STDERR: " +
                                                                  result.stderr
                                                              );
                                                            }
                                                          })
                                                          .then(
                                                            async function () {
                                                              ssh
                                                                .execCommand(
                                                                  "systemctl enable postfix",
                                                                  { cwd: "/" }
                                                                )
                                                                .then(
                                                                  async function (
                                                                    result
                                                                  ) {
                                                                    if (
                                                                      result.stdout
                                                                    ) {
                                                                      console.log(
                                                                        "STDOUT: " +
                                                                          result.stdout
                                                                      );
                                                                    }
                                                                    //console.log('STDERR: ' + result.stderr)
                                                                    if (
                                                                      result.stderr
                                                                    ) {
                                                                      console.log(
                                                                        "STDERR: " +
                                                                          result.stderr
                                                                      );
                                                                    }
                                                                  }
                                                                )
                                                                .then(
                                                                  async function () {
                                                                    ssh
                                                                      .execCommand(
                                                                        "systemctl restart postfix",
                                                                        {
                                                                          cwd: "/",
                                                                        }
                                                                      )
                                                                      .then(
                                                                        async function (
                                                                          result
                                                                        ) {
                                                                          //console.log('now IT Is THE FINAL COUNTDOWN TIRURIRU')
                                                                          if (
                                                                            result.stdout
                                                                          ) {
                                                                            console.log(
                                                                              "STDOUT: " +
                                                                                result.stdout
                                                                            );
                                                                          }
                                                                          //console.log('STDERR: ' + result.stderr)
                                                                          if (
                                                                            result.stderr
                                                                          ) {
                                                                            console.log(
                                                                              "STDERR: " +
                                                                                result.stderr
                                                                            );
                                                                          }
                                                                          // res.status(200).send('Success');
                                                                          console.log(
                                                                            "done installing packages"
                                                                          );
                                                                        }
                                                                      );
                                                                  }
                                                                );
                                                            }
                                                          );
                                                      });
                                                  });
                                              });
                                          });
                                      });
                                  });
                              });
                          });
                      });
                  });
              });
          });
      })
      .catch((error) => {
        console.log(error);
        console.log("errorrrrrrrrrrrrrrrr");
        // return res.status(400).send('Error. Try Again');
      });
  } catch (error) {
    console.log(error);
  }
};

exports.uploadServiceImages = upload.single("file");

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name) return res.status(400).send("Name is required");

    if (!password || password.length < 6)
      return res
        .status(400)
        .send("Password is required and should be min 6 characters long");

    await User.findOne({ email }, async (err, user) => {
      if (user) {
        return res.status(400).send("Email is taken");
      } else {
        const hasPassword = await hashPassword(password);

        const user = new User({ name, email, password: hasPassword });
        await user.save();

        const emailSettings = new EmailSettings({
          user: user._id,
          host: "543",
          port: "543",
          email_user: email,
          email_password: hasPassword,
        });
        await emailSettings.save();

        const linodeSettings = new LinodeSettings({ user: user._id, key: "" });
        await linodeSettings.save();

        const bitlaunchSettings = new BitlauchSettings({
          user: user._id,
          key: "",
        });
        await bitlaunchSettings.save();

        const vultrSettings = new VultrSettings({ user: user._id, key: "" });
        await vultrSettings.save();

        const digitalOceanSettings = new DigitalOceanSettings({
          user: user._id,
          key: "",
        });
        await digitalOceanSettings.save();

        ///*console.log(user);
        //console.log(emailSettings);
        //console.log(linodeSettings);*/

        return res.json({ ok: true });
      }
    });
  } catch (error) {
    //console.log(error);
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).exec();
    if (!user) return res.status(400).send("No user found");

    const match = await comparePassword(password, user.password);
    //jwt
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    //
    user.password = undefined;
    //
    res.cookie("token", token, {
      httpOnly: true,
      // secure:true
    });

    return res.json(user);
  } catch (error) {
    console.log(error);
    return res.status(400).send("Error. Try Again");
  }
};

exports.logout = async (req, res) => {
  try {
    res.clearCookie("token");
    return res.json({ message: "Signout success" });
  } catch (error) {
    //console.log(error);
    return res.status(400).send("Error. Try Again");
  }
};

exports.currentUser = async (req, res) => {
  try {
    //const user = await User.findById(req.user._id).select('-password').exec();
    //console.log('CURRENT USER', user.email);
    return res.json({ user: "jsmrno520@gmail.com" });
  } catch (error) {
    //console.log(error);
    return res.status(400).send("Error. Try Again");
  }
};

exports.createTemplate = async (req, res) => {
  try {
    const { senderName, subject, message, senderEmail } = req.body;
    //console.log(req.body);
    if (!title) return res.status(400).send("Title is required");
    if (!subject) return res.status(400).send("Subject is required");
    if (!message) return res.status(400).send("Message is required");

    //might be usseless later
    //let templateExists = await EmailTemplate.findOne({title}).exec();
    //if(templateExists) return res.status(400).send("Template with that title already exists");

    const template = new EmailTemplate({
      senderName,
      subject,
      message,
      senderEmail,
    });
    await template.save();
    //console.log(template);
    return res.json({ ok: true });
  } catch (error) {
    console.log(error);
    return res.status(400).send("Error. Try Again");
  }
};

exports.getTemplates = async (req, res) => {
  try {
    const templates = await EmailTemplate.find();
    return res.json(templates);
  } catch (error) {
    //console.log(error);
    return res.status(400).send("Error. Try Again");
  }
};

exports.deleteTemplate = async (req, res) => {
  try {
    const templates = await EmailTemplate.findByIdAndDelete(req.params.id);
    return res.json({ ok: true });
  } catch (error) {
    //console.log(error);
    return res.status(400).send("Error. Try Again");
  }
};

exports.updateTemplate = async (req, res) => {
  try {
    const template = await EmailTemplate.findByIdAndUpdate(
      req.body.idTemplate,
      {
        title: req.body.title,
        subject: req.body.subject,
        message: req.body.message,
      }
    );

    // const template = await EmailTemplate.findB({id:req.body.idTemplate});
    return res.json({ ok: true });
  } catch (error) {
    //console.log(error);
    return res.status(400).send("Error. Try Again");
  }
};

exports.getEmailSettings = async (req, res) => {
  try {
    const settings = await EmailSettings.find();
    //// console.log(req.params.id);
    return res.json(settings);
  } catch (error) {
    //console.log(error);
    return res.status(400).send("Error. Try Again");
  }
};

exports.updateEmailSettings = async (req, res) => {
  try {
    const user = req.body.user;
    const update = {
      host: req.body.host,
      port: req.body.port,
      email_user: req.body.userEmail,
      email_password: req.body.passwordEmail,
      useTLS: req.body.useTls,
      useSSL: req.body.useSll,
    };
    const emailUserSettings = await EmailSettings.findOneAndUpdate(
      user,
      update
    ).exec();
    // const settings = await EmailSettings.findOne();
    //// console.log(settings);
    return res.status(200).json(emailUserSettings);
  } catch (error) {
    //console.log(error);
    return res.status(400).send("Error. Try Again");
  }
};

exports.getLinodeSettings = async (req, res) => {
  try {
    const settings = await LinodeSettings.find();
    //// console.log(settings);
    //// console.log(req.params.id);
    return res.json(settings);
  } catch (error) {
    //console.log(error);
    return res.status(400).send("Error. Try Again");
  }
};

exports.getBitLaunchSettings = async (req, res) => {
  try {
    const settings = await BitlauchSettings.find();
    return res.json(settings);
  } catch (error) {
    //console.log(error);
    return res.status(400).send("Error. Try Again");
  }
};

exports.getVultrSettings = async (req, res) => {
  try {
    const settings = await VultrSettings.find();
    return res.json(settings);
  } catch (error) {
    //console.log(error);
    return res.status(400).send("Error. Try Again");
  }
};
exports.getDigitalOceanSettings = async (req, res) => {
  try {
    const settings = await DigitalOceanSettings.find();
    return res.json(settings);
  } catch (error) {
    //console.log(error);
    return res.status(400).send("Error. Try Again");
  }
};

exports.getLinodeRegions = async (req, res) => {
  try {
    const regions = await axios.get(`https://api.linode.com/v4/regions`);
    //// console.log(regions.data);
    //// console.log(req.params.id);
    return res.status(200).send(regions.data);
  } catch (error) {
    //console.log(error);
    return res.status(400).send("Error. Try Again");
  }
};

exports.getBitlaunchRegions = async (req, res) => {
  try {
    const bitlaunchData = await BitlauchSettings.find();
    if (!bitlaunchData.length) {
      return res.send([]);
    } else {
      const response = await axios.get(
        `https://app.bitlaunch.io/api/hosts-create-options/4`,
        {
          headers: {
            Authorization: `Bearer ${bitlaunchData[0].key}`,
            "Content-Type": "application/json",
          },
        }
      );
    }
    console.log(response.data);
    return res.status(200).send(response.data);
  } catch (error) {
    console.log(error);
    return res.status(400).send("Error. Try Again");
  }
};
exports.getVultrRegions = async (req, res) => {
  try {
    const vultrData = await VultrSettings.find();
    const response = await axios.get(`https://api.vultr.com/v2/regions`, {
      headers: {
        Authorization: `Bearer ${vultrData[0].key}`,
        "Content-Type": "application/json",
      },
    });
    ////console.log(response.data)
    return res.status(200).send(response.data);
  } catch (error) {
    //console.log(error);
    return res.status(400).send("Error. Try Again");
  }
};
exports.getDigitalOceanRegions = async (req, res) => {
  try {
    const digitalOceanData = await DigitalOceanSettings.find();
    const response = await axios.get(
      `https://api.digitalocean.com/v2/regions`,
      {
        headers: {
          Authorization: `Bearer ${digitalOceanData[0].key}`,
          "Content-Type": "application/json",
        },
      }
    );
    ////console.log(response.data)
    return res.status(200).send(response.data);
  } catch (error) {
    //console.log(error);
    return res.status(400).send("Error. Try Again");
  }
};

exports.createLinodeServer = async (req, res) => {
  try {
    const server = new LinodeServers(req.body);
    await server.save();
    ////console.log(server);
    return res.json({ ok: true });
  } catch (error) {
    //console.log(error);
    return res.status(400).send("Error. Try Again");
  }
};

exports.getLinodeServers = async (req, res) => {
  try {
    const serversList = await LinodeServers.find();
    // console.log(serversList)
    await Promise.all(
      serversList.map(async (server, i) => {
        if (server.softwareVersion == "No software installed yet") {
          // if(server.softwareVersion == 'No software installed yet' && server.serverInfo.status =='running'){
          var updatedServer = await installProcessOnServer(
            server,
            LinodeServers
          );
        }
      })
    );
    var servers = [];

    for (var server of serversList) {
      const emails = await EmailSended.find({
        server: server.serverInfo.ipv4[0],
      });
      var listEmails = { sendedEmails: emails };
      shit = { ...server._doc, ...listEmails };
      servers.push(shit);
    }
    return res.json(servers);
  } catch (error) {
    //console.log(error);
    return res.status(400).send("Error. Try Again");
  }
};
exports.getVultrServers = async (req, res) => {
  try {
    const serversList = await VultrServers.find();
    await Promise.all(
      serversList.map(async (server, i) => {
        if (server.softwareVersion == "No software installed yet") {
          // if(server.softwareVersion == 'No software installed yet' && server.serverInfo.status =='running'){
          var updatedServer = await installProcessOnServer(
            server,
            VultrServers
          );
          console.log("olala");
        }
      })
    );
    var servers = [];
    for (var server of serversList) {
      const emails = await EmailSended.find({
        server: server.serverInfo.ipv4[0],
      });
      var listEmails = { sendedEmails: emails };
      shit = { ...server._doc, ...listEmails };
      servers.push(shit);
    }
    return res.json(servers);
  } catch (error) {
    //console.log(error);
    return res.status(400).send("Error. Try Again");
  }
};
exports.getDigitalOceanServers = async (req, res) => {
  try {
    const serversList = await DigitalOceanServers.find();
    await Promise.all(
      serversList.map(async (server, i) => {
        // if(server.softwareVersion == 'No software installed yet' && server.serverInfo.status =='running'){
        if (server.softwareVersion == "No software installed yet") {
          var updatedServer = await installProcessOnServer(
            server,
            DigitalOceanServers
          );
          console.log("olala");
        }
      })
    );
    var servers = [];
    for (var server of serversList) {
      const emails = await EmailSended.find({
        server: server.serverInfo.ipv4[0],
      });
      var listEmails = { sendedEmails: emails };
      shit = { ...server._doc, ...listEmails };
      servers.push(shit);
    }
    return res.json(servers);
  } catch (error) {
    //console.log(error);
    return res.status(400).send("Error. Try Again");
  }
};

exports.getBitLaunchServers = async (req, res) => {
  try {
    const serversList = await BitLaunchServers.find();
    if (!serversList.lenght) {
      return res.send([]);
    } else {
      await Promise.all(
        serversList.map(async (server, i) => {
          // if(server.softwareVersion == 'No software installed yet' && server.serverInfo.status =='running'){
          if (server.softwareVersion == "No software installed yet") {
            var updatedServer = await installProcessOnServer(
              server,
              BitLaunchServers
            );
            console.log("olala");
          }
        })
      );
      var servers = [];
      for (var server of serversList) {
        const emails = await EmailSended.find({
          server: server.serverInfo.ipv4[0],
        });
        var listEmails = { sendedEmails: emails };
        shit = { ...server._doc, ...listEmails };
        servers.push(shit);
      }
      return res.json(servers);
    }
  } catch (error) {
    console.log(error);
    return res.status(400).send("Error. Try Again");
  }
};

exports.getCustomServers = async (req, res) => {
  try {
    const serversList = await CustomServers.find();
    if (!serversList.length) {
      return res.send([]);
    } else {
      var servers = [];
      for (var server of serversList) {
        const emails = await EmailSended.find({
          server: server.serverInfo.ipv4,
        });
        var listEmails = { sendedEmails: emails };
        shit = { ...server._doc, ...listEmails };
        servers.push(shit);
      }
      return res.json(servers);
    }
  } catch (error) {
    //console.log(error);
    return res.status(400).send("Error. Try Again");
  }
};

exports.updateLinodeSettings = async (req, res) => {
  try {
    const user = req.body.user;
    const update = {
      key: req.body.key,
    };
    const emailUserSettings = await LinodeSettings.findOneAndUpdate(
      user,
      update
    ).exec();
    //console.log(emailUserSettings);
    return res.status(200).json(emailUserSettings);
  } catch (error) {
    //console.log(error);
    return res.status(400).send("Error. Try Again");
  }
};
exports.updateDigitalOceanSettings = async (req, res) => {
  try {
    const user = req.body.user;
    const update = {
      key: req.body.keyDigitalOcean,
    };
    //console.log(update)
    const emailUserSettings = await DigitalOceanSettings.findOneAndUpdate(
      user,
      update
    ).exec();
    //console.log(emailUserSettings);
    return res.status(200).json(emailUserSettings);
  } catch (error) {
    //console.log(error);
    return res.status(400).send("Error. Try Again");
  }
};

exports.updateBitLaunchSettings = async (req, res) => {
  try {
    const user = req.body.user;
    const update = {
      key: req.body.keyBitLaunch,
    };
    //// console.log(update)
    const emailUserSettings = await BitlauchSettings.findOneAndUpdate(
      user,
      update
    ).exec();
    //console.log(emailUserSettings);
    return res.status(200).json(emailUserSettings);
  } catch (error) {
    //console.log(error);
    return res.status(400).send("Error. Try Again");
  }
};

exports.updateVultrSettings = async (req, res) => {
  try {
    const user = req.body.user;
    const update = {
      key: req.body.keyVultr,
    };
    //// console.log(update)
    const emailUserSettings = await VultrSettings.findOneAndUpdate(
      user,
      update
    ).exec();
    //console.log(emailUserSettings);
    return res.status(200).json(emailUserSettings);
  } catch (error) {
    //console.log(error);
    return res.status(400).send("Error. Try Again");
  }
};

exports.deployLinodeServer = async (req, res) => {
  //// console.log(req.body.country)
  if (!req.body.key || req.body.key == "") {
    return res.status(400).send("Please verify your Linode Key");
  }

  try {
    let idGen = uuidv4();
    idGen = idGen.slice(0, -14);
    ////console.log(idGen);
    var data = {
      type: "g6-standard-1",
      region: `${req.body.country}`,
      image: "linode/centos7",
      label: `${idGen}`,
      private_ip: true,
      root_pass: "aComplexP@ssword!",
      backups_enabled: true,
      booted: true,
      swap_size: 512,
    };
    console.log(JSON.stringify(data));
    const response = await axios.post(
      `https://api.linode.com/v4/linode/instances`,
      JSON.stringify(data),
      {
        headers: {
          Authorization: `Bearer ${req.body.key}`,
          "Content-Type": "application/json",
        },
      }
    );
    const server = response.data;

    var firstName = fakerator.names.firstName();
    var lastName = fakerator.names.lastName();
    var space = " ";
    var fullName = firstName.concat(space, lastName);
    var fakeEmail = fakerator.internet.email(firstName, lastName);
    // var fakeDomain = fakerator.internet.domain();
    // var fakeEmail = fakerator.internet.email();
    //// console.log(fakeDomain)
    const newServer = new LinodeServers({
      key: req.body.key,
      softwareVersion: "No software installed yet",
      serverInfo: server,
      fakeDomain: fullName,
      fakeEmail: fakeEmail,
    });
    const result = await newServer.save();

    //console.log(result.serverInfo.ipv4[0])

    res.status(200).send("Success, server is now deploying");
  } catch (err) {
    console.log({
      status_code: err.response.status,
      url: "https://api.linode.com/v4/linode/instances",
    });
    res.status(400).json(err);
  }
};
exports.deployDigitalOceanServer = async (req, res) => {
  //// console.log(req.body.country)
  if (!req.body.key || req.body.key == "") {
    return res.status(400).send("Please verify your Linode Key");
  }

  try {
    let idGen = uuidv4();
    idGen = idGen.slice(0, -14);
    ////console.log(idGen);
    // var data = {
    //   "type": "g6-standard-1",
    //   "region": `${req.body.country}`,
    //   "image": "linode/centos7",
    //   "label": `${idGen}`,
    //   "private_ip": true,
    //   "root_pass": "aComplexP@ssword"
    // };
    var data = {
      name: "testtestte",
      region: `${req.body.country}`,
      size: "s-1vcpu-1gb",
      image: 7555621,
      ssh_keys: [
        "AAAAB3NzaC1yc2EAAAADAQABAAABAQDgqSd9XLOABem1KBcjk9Gih2p0nKiJqACWkpg2+5h/+CEJMXeBWNDC0RZIPYq6I9VWyQhWRN0gC/rD9ri7Oy9VZXP2S/KubMT8IWtzOfdg0TzXzg+IhKEEfOfcxvVyo6duPlr3Yr7RRHG3J/RTHh2EpMjgS1i1gWSW5EdE86FEq5eiw7MYk+dN8CEN/MkaZUdO7lhhN7vxbytjkWqTbUHGRCWNm3cB12rXa3NIrcQ/MIa+swACLl/Y7n6xgJBZSgjCxV0dEdWlMz+ApnLLSRCZjqnqXFphLHKJ23UdLsca7KS0Ipxm+T6DbjrZCMXHMnALBgV9oA6S5uA3lEo4+ZL9",
      ],
      backups: false,
      ipv6: true,
      user_data: null,
      private_networking: null,
      volumes: null,
      tags: ["web"],
    };
    const response = await axios.post(
      `https://api.digitalocean.com/v2/droplets`,
      JSON.stringify(data),
      {
        headers: {
          Authorization: `Bearer ${req.body.key}`,
          "Content-Type": "application/json",
        },
      }
    );
    const server = response.data;

    var firstName = fakerator.names.firstName();
    var lastName = fakerator.names.lastName();
    var space = " ";
    var fullName = firstName.concat(space, lastName);
    var fakeEmail = fakerator.internet.email(firstName, lastName);
    // var fakeDomain = fakerator.internet.domain();
    // var fakeEmail = fakerator.internet.email();
    //// console.log(fakeDomain)
    const newServer = new DigitalOceanServers({
      key: req.body.key,
      softwareVersion: "No software installed yet",
      serverInfo: server,
      fakeDomain: fullName,
      fakeEmail: fakeEmail,
    });
    const result = await newServer.save();

    //console.log(result.serverInfo.ipv4[0])

    res.status(200).send("Success, server is now deploying");
  } catch (err) {
    //console.log(err)
    //// console.log(err.response);
    //// console.log('maldita sea')
    res.status(400).json(err);
  }
};

exports.deployBitLaunchServer = async (req, res) => {
  //console.log(req.body)

  if (!req.body.key || req.body.key == "") {
    return res.status(400).send("Please verify your Linode Key");
  }

  try {
    var dataString = `{"server":{"name":"my-awesome-server","hostID":4,"imageID":1,"hostImageID":"11000","imageType":"image","imageDescription":"CentOS 7.6","sizeID":"nibble-1024","regionID":"${req.body.country}","password":"aComplexP@ssword","initscript":"#!/bin/sh echo \'hello\' > /root/hello"}}`;

    let idGen = uuidv4();
    idGen = idGen.slice(0, -14);
    ////console.log(idGen);
    var data = {
      name: idGen,
      hostID: 4,
      imageID: 1,
      hostImageID: "10000",
      imageType: "image",
      imageDescription: "Ubuntu (Ubuntu 18.04 LTS)",
      sizeID: "nibble-1024",
      regionID: "ams1",
      // "sshKeys":["aaaaaaaaaaabbbbbbbbbbbbb"],
      password: "aComplexP@ssword",
      initscript: "#!/bin/sh echo 'hello' > /root/hello",
    };
    const response = await axios.post(
      `https://app.bitlaunch.io/api/servers`,
      dataString,
      {
        headers: {
          Authorization: `Bearer ${req.body.key}`,
          "Content-Type": "application/json",
        },
      }
    );

    //console.log(response.data)
    const server = response.data;

    var firstName = fakerator.names.firstName();
    var lastName = fakerator.names.lastName();
    var space = " ";
    var fullName = firstName.concat(space, lastName);
    var fakeEmail = fakerator.internet.email(firstName, lastName);

    const newServer = new BitLaunchServers({
      key: req.body.key,
      softwareVersion: "No software installed yet",
      serverInfo: server,
      fakeDomain: fullName,
      fakeEmail: fakeEmail,
    });
    //console.log(newServer)
    const result = await newServer.save();
    //console.log(result)
    res.status(200).send("Success, server is now deploying");
  } catch (err) {
    //console.log(err)
    res.status(400).send(err);
  }
};
exports.deployVultrServer = async (req, res) => {
  //console.log(req.body)

  if (!req.body.key || req.body.key == "") {
    return res.status(400).send("Please verify your Linode Key");
  }

  try {
    let idGen = uuidv4();
    idGen = idGen.slice(0, -14);
    ////console.log(idGen);
    var dataString = {
      region: `${req.body.country}`,
      plan: "vc2-6c-16gb",
      label: `${idGen}`,
      os_id: 167,
      user_data: "QmFzZTY0IEV4YW1wbGUgRGF0YQ==",
      backups: "enabled",
    };
    const response = await axios.post(
      `https://api.vultr.com/v2/instances`,
      dataString,
      {
        headers: {
          Authorization: `Bearer ${req.body.key}`,
          "Content-Type": "application/json",
        },
      }
    );

    //console.log(response.data)
    const server = response.data;

    var firstName = fakerator.names.firstName();
    var lastName = fakerator.names.lastName();
    var space = " ";
    var fullName = firstName.concat(space, lastName);
    var fakeEmail = fakerator.internet.email(firstName, lastName);

    const newServer = new VultrServers({
      key: req.body.key,
      softwareVersion: "No software installed yet",
      serverInfo: server,
      fakeDomain: fullName,
      fakeEmail: fakeEmail,
    });
    //console.log(newServer)
    const result = await newServer.save();
    //console.log(result)
    res.status(200).send("Success, server is now deploying");
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
};

exports.deleteLinodeServer = async (req, res) => {
  try {
    const server = await LinodeServers.findById(req.params.id);
    //console.log(server);
    const { key, serverInfo } = server;

    const response = await axios.delete(
      `http://api.linode.com/v4/linode/instances/${serverInfo.id}`,
      {
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
      }
    );
    //console.log(response);
    if (response) {
      const server = await LinodeServers.findByIdAndDelete(req.params.id);
      return res.json({ ok: true });
    }
    return res.status(401);
  } catch (error) {
    //console.log(error);
    return res.status(400).send("Error. Try Again");
  }
};
exports.deleteDigitalOceanServer = async (req, res) => {
  try {
    const server = await DigitalOceanServers.findById(req.params.id);
    //console.log(server);
    const { key, serverInfo } = server;

    const response = await axios.delete(
      `https://api.digitalocean.com/v2/droplets/${serverInfo.id}`,
      {
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
      }
    );
    //console.log(response);
    if (response) {
      const server = await LinodeServers.findByIdAndDelete(req.params.id);
      return res.json({ ok: true });
    }
    return res.status(401);
  } catch (error) {
    //console.log(error);
    return res.status(400).send("Error. Try Again");
  }
};

exports.deleteVultrServer = async (req, res) => {
  try {
    const server = await VultrServers.findById(req.params.id);
    //console.log(server);
    const { key, serverInfo } = server;

    const response = await axios.delete(
      `https://api.vultr.com/v2/instances/${serverInfo.id}`,
      {
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
      }
    );
    //console.log(response);
    if (response) {
      const server = await VultrServers.findByIdAndDelete(req.params.id);
      return res.json({ ok: true });
    }
    return res.status(401);
  } catch (error) {
    //console.log(error);
    return res.status(400).send("Error. Try Again");
  }
};

exports.deleteCustomServer = async (req, res) => {
  try {
    //console.log(req.params.id)
    const server = await CustomServers.findByIdAndDelete(req.params.id);
    return res.json({ ok: true });
  } catch (error) {
    //console.log(error);
    return res.status(400).send("Error. Try Again");
  }
};

exports.deleteBitlaunchServer = async (req, res) => {
  try {
    const server = await BitLaunchServers.findById(req.params.id);
    //console.log(server);
    const { key, serverInfo } = server;

    const response = await axios.delete(
      `https://app.bitlaunch.io/api/servers/${serverInfo.id}`,
      {
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
      }
    );
    //console.log(response);
    if (response) {
      const server = await BitLaunchServers.findByIdAndDelete(req.params.id);
      return res.json({ ok: true });
    }
    return res.status(401);
  } catch (error) {
    //console.log(error);
    return res.status(400).send("Error. Try Again");
  }
};

exports.parseCSV = async (req, res, next) => {
  if (req.body.manualTargetEmails) {
    next();
  } else {
    let targetEmails = [];
    fs.createReadStream(path.resolve(__dirname, "../assets", "parse.csv"))
      // .pipe(csv.parse({ headers: true }))
      .pipe(csv.parse())
      .on("error", (error) => console.error(error))
      .on("data", async (row) => {
        targetEmails.push(row[0]);
        //// console.log(row[0])
      })
      .on("end", (rowCount) => {
        // targetEmails.forEach(function (item, index) {
        ////   console.log(item);
        // });
        if (targetEmails.length > 0) {
          req.body.targetEmails = targetEmails;
          fs.unlink(
            path.resolve(__dirname, "../assets", "parse.csv"),
            (err) => {
              if (err) {
                //console.log(err)
              } else {
              }
            }
          );
          next();
        } else {
        }
      });
  }
};

exports.getTemplate = async (req, res) => {
  try {
    //console.log(req.params.id)
    const template = await EmailTemplate.findById(req.params.id).exec();
    //console.log('REQUESTED TEMPLATE', template);
    return res.json(template);
  } catch (error) {
    //console.log(error);
    return res.status(400).send("Error. Try Again");
  }
};

exports.sendEmail = async (req, res) => {
  try {
    const {
      titleForm,
      senderEmail,
      subjectForm,
      message,
      useSmtp,
      selectedTemplate,
      host,
      port,
      email_user,
      email_password,
      key,
      targetEmails,
      intervalTime,
      emailPerMail,
      headers,
      ssl,
      tls,
      servers,
      manualTargetEmails,
    } = req.body;
    const myObj = req.body.headers;

    var secure = port == 465 ? true : false;
    //if (!intervalTime || !emailPerMail){return res.status(400).send('Error. Please select a valid server');}
    // var arrResults = []
    // var fakeName
    // var fakeEmail
    // if (!senderEmail || !titleForm) {
    //   var firstName = fakerator.names.firstName();
    //   var lastName = fakerator.names.lastName();
    //   var space = ' ';
    //   fullName = firstName.concat(space, lastName);
    //   fakeEmail = fakerator.internet.email(firstName, lastName);
    // } else {
    //   fullName = titleForm
    //   fakeEmail = senderEmail
    // }
    console.log("hey");
    let cleanArrEmails = [];
    const cleanEmailArray = (space) => {
      var cleanArrEmails = [];
      var spaces = space.split(" ");
      for (let i = 0; i < spaces.length; i++) {
        if (spaces[i].includes("\n")) {
          let clean = spaces[i].split("\n");
          for (let email of clean) {
            cleanArrEmails.push(email);
          }
        } else if (spaces[i].includes(",")) {
          let clean = spaces[i].split(",");
          for (let email of clean) {
            cleanArrEmails.push(email);
          }
        } else {
          cleanArrEmails.push(spaces[i]);
        }
      }
      return cleanArrEmails;
    };
    if (manualTargetEmails) {
      cleanArrEmails = cleanEmailArray(manualTargetEmails);
    } else if (targetEmails) {
      cleanArrEmails = cleanEmailArray(targetEmails);
    }

    let arrayOfServers = servers && servers.split(",");
    const nServer = arrayOfServers.length;

    const chunks = (a, size) =>
      Array.from(new Array(Math.ceil(a.length / size)), (_, i) =>
        a.slice(i * size, i * size + size)
      );

    const arrEmailsChunks = chunks(
      cleanArrEmails,
      cleanArrEmails.length / nServer
    );

    var bar = new Promise((resolve, reject) => {
      arrayOfServers.forEach(async (value, index, array) => {
        const emails = arrEmailsChunks[index];
        var serverData;
        var serverIP;
        var fakeDomain;
        var fakeEmail;

        var resultFindLinode = await LinodeServers.findById(value);
        if (resultFindLinode) {
          serverIP = resultFindLinode.serverInfo.ipv4[0];
          fakeDomain = resultFindLinode.fakeDomain;
          fakeEmail = resultFindLinode.fakeEmail;
        }
        var resultFindBitlaunch = await BitLaunchServers.findById(value);
        if (resultFindBitlaunch) {
          serverIP = resultFindBitlaunch.serverInfo.ipv4;
          fakeDomain = resultFindBitlaunch.fakeDomain;
          fakeEmail = resultFindBitlaunch.fakeEmail;
        }
        var resultFindCustom = await CustomServers.findById(value);
        if (resultFindCustom) {
          serverIP = resultFindCustom.serverInfo.ipv4;
          fakeDomain = resultFindCustom.fakeDomain;
          fakeEmail = resultFindCustom.fakeEmail;
        }
        var resultFindVultr = await VultrServers.findById(value);
        if (resultFindVultr) {
          serverIP = resultFindVultr.serverInfo.ipv4;
          fakeDomain = resultFindVultr.fakeDomain;
          fakeEmail = resultFindVultr.fakeEmail;
        }

        var data = {};

        if (!senderEmail) {
          data = {
            titleForm: fakeDomain,
            subjectForm: subjectForm,
            senderEmail: fakeEmail,
            message: message,
            useSmtp: useSmtp,
            selectedTemplate: selectedTemplate,
            host: host,
            port: port,
            email_user: email_user,
            email_password: email_password,
            key: key,
            secure: secure,
            targetEmails: emails,
            server: serverIP,
            intervalTime: intervalTime,
            emailPerMail: emailPerMail,
            headers: myObj,
            tls: tls,
            ssl: ssl,
          };
          console.log("processing with no sender Email data");

          /*
          if (emails.length == 1) {
            const queue = new emailQueue({ data, emailAmount: 1 })
            const savedQueue = await queue.save()
          } else {
            const queue = new emailQueue({ data, emailAmount: emails.length })
            const savedQueue = await queue.save()
          }
           */
        } else {
          data = {
            titleForm: titleForm,
            subjectForm: subjectForm,
            senderEmail: senderEmail,
            message: message,
            useSmtp: useSmtp,
            selectedTemplate: selectedTemplate,
            host: host,
            port: port,
            secure: secure,
            email_user: email_user,
            email_password: email_password,
            key: key,
            targetEmails: emails,
            server: serverIP,
            intervalTime: intervalTime,
            emailPerMail: emailPerMail,
            headers: myObj,
            tls: tls,
            ssl: ssl,
          };
          console.log("processing with sender Email data");
          //console.log(data)
          /*
          if (emails.length == 1) {
            const queue = new emailQueue({ data, emailAmount: 1 })
            const savedQueue = await queue.save()

          } else {
            const queue = new emailQueue({ data, emailAmount: emails.length })
            const savedQueue = await queue.save()

          }
          */
        }

        if (emails.length == 1) {
          const queue = new emailQueue({ data, emailAmount: 1 });
          const savedQueue = await queue.save();
        } else {
          const queue = new emailQueue({ data, emailAmount: emails.length });
          const savedQueue = await queue.save();
        }

        if (index === array.length - 1) resolve();
      });
    });

    bar.then(() => {
      res.status(200).send("Success");
      emailQueue.find(async (error, result) => {
        if (error) {
          console.log(error);
        } else {
          for (let resulted of result) {
            setTimeout(async () => {
              await axios
                .post(
                  `http://${resulted.data.server}:8001/api/run-emails-smtp`,
                  resulted.data
                )
                .then((response) => {
                  console.log(`Call done ${resulted.data.server}`);
                })
                .catch((error) => {
                  console.log(`error post ${error}`); //${resulted.data.server}`)
                });
            }, resulted.data.intervalTime * 1000);
            emailQueue.findByIdAndDelete(resulted._id, (error, result) => {
              if (error) {
                console.log(error);
              } else {
                console.log("done with " + result.data.server);
              }
            });
          }
        }
      });
    });

    /* emailQueue.find().exec(async (error, result) => {
          if (error) {
            console.log(error)
          } else {
            for (let resulted of result) {
              let { emailAmount, data } = resulted//: { titleForm, subjectForm, senderEmail, message, useSmtp, selectedTemplate, host, port, secure, email_user, email_password, targetEmails, server, intervalTime, emailPerMail, headers, tls, ssl }
    
              axios.post(`http://${data.server}:8001/api/run-emails-smtp`, data).then((response) => {
                console.log(`Call done ${data.server}`)
              })
            }
          }
        })*/
  } catch (error) {
    console.log(error);
    return res.status(400).send("Error. Try Again");
  }
};

exports.requestEmailProcessorM = async (req, res) => {
  const {
    titleForm,
    senderEmail,
    subjectForm,
    message,
    useSmtp,
    selectedTemplate,
    host,
    port,
    email_user,
    email_password,
    key,
    targetEmails,
    intervalTime,
    emailPerMail,
    headers,
    ssl,
    tls,
    servers,
    manualTargetEmails,
  } = req.body;
  const myObj = req.body.headers;

  if (!servers || !intervalTime || !emailPerMail) {
    return res.status(400).send("Error. Please select a valid server");
  } else {
    let arrayOfServers = servers && servers.split(",");

    if (req.body.manualTargetEmails) {
      try {
        let cleanArr = [];
        let spaces = manualTargetEmails.split(" ");

        for (let i = 0; i < spaces.length; i++) {
          if (spaces[i].includes("\n")) {
            let clean = spaces[i].split("\n");
            for (let email of clean) {
              cleanArr.push(email);
            }
          } else {
            cleanArr.push(spaces[i]);
          }
        }

        const nServer = arrayOfServers.length;

        const chunks = (a, size) =>
          Array.from(new Array(Math.ceil(a.length / size)), (_, i) =>
            a.slice(i * size, i * size + size)
          );

        const resultShit = chunks(cleanArr, cleanArr.length / nServer);

        var bar = new Promise((resolve, reject) => {
          arrayOfServers.forEach(async (value, index, array) => {
            const emails = resultShit[index];
            //// console.log(value)

            var resultFindLinode = await LinodeServers.findById(value);
            if (resultFindLinode) {
              serverIP = resultFindLinode.serverInfo.ipv4[0];
              fakeDomain = resultFindLinode.fakeDomain;
              fakeEmail = resultFindLinode.fakeEmail;
            }
            var resultFindBitlaunch = await BitLaunchServers.findById(value);
            if (resultFindBitlaunch) {
              serverIP = resultFindBitlaunch.serverInfo.ipv4;
              fakeDomain = resultFindBitlaunch.fakeDomain;
              fakeEmail = resultFindBitlaunch.fakeEmail;
            }
            var resultFindCustom = await CustomServers.findById(value);
            if (resultFindCustom) {
              serverIP = resultFindCustom.serverInfo.ipv4;
              fakeDomain = resultFindCustom.fakeDomain;
              fakeEmail = resultFindCustom.fakeEmail;
            }
            var resultFindVultr = await VultrServers.findById(value);
            if (resultFindVultr) {
              serverIP = resultFindVultr.serverInfo.ipv4;
              fakeDomain = resultFindVultr.fakeDomain;
              fakeEmail = resultFindVultr.fakeEmail;
            }

            if (!senderEmail) {
              //console.log('epa loco 1')
              var data = {
                titleForm: fakeDomain,
                subjectForm: subjectForm,
                senderEmail: fakeEmail,
                message: message,
                useSmtp: useSmtp,
                selectedTemplate: selectedTemplate,
                host: host,
                port: port,
                email_user: email_user,
                email_password: email_password,
                key: key,
                targetEmails: emails,
                // "server":serverInfo.ipv4[0],
                server: serverIP,
                intervalTime: intervalTime,
                emailPerMail: emailPerMail,
                headers: myObj,
                tls: req.body.tls,
                ssl: ssl,
              };

              ////console.log(data)
              axios
                .post(`http://${serverIP}:8001/api/run-emails`, data)
                .then((response) => {
                  //console.log('THE RESPONSE')
                })
                .catch((error) => {
                  //console.log('error 1')
                });
            } else {
              //console.log('epa loco 2')
              var data = {
                titleForm: titleForm,
                subjectForm: subjectForm,
                senderEmail: senderEmail,
                message: message,
                useSmtp: useSmtp,
                selectedTemplate: selectedTemplate,
                host: host,
                port: port,
                email_user: email_user,
                email_password: email_password,
                key: key,
                targetEmails: emails,
                server: serverIP,
                intervalTime: intervalTime,
                emailPerMail: emailPerMail,
                headers: myObj,
                tls: req.body.tls,
                ssl: ssl,
              };
              ////console.log(data)

              axios
                .post(`http://${serverIP}:8001/api/run-emails`, data)
                .then((response) => {
                  //console.log('THE RESPONSE')
                })
                .catch((error) => {
                  //console.log('error 1')
                });
            }
            if (index === array.length - 1) resolve();
          });
        });

        bar.then(() => {
          res.status(200).send("Success");
        });
      } catch (error) {}
    } else {
      //this does not do the chunk thing xd
      //console.log('ay verga')
      try {
        const nServer = arrayOfServers.length;
        const chunks = (a, size) =>
          Array.from(new Array(Math.ceil(a.length / size)), (_, i) =>
            a.slice(i * size, i * size + size)
          );

        const resultShit = chunks(targetEmails, targetEmails.length / nServer);

        var bar = new Promise((resolve, reject) => {
          arrayOfServers.forEach(async (value, index, array) => {
            const emails = resultShit[index];
            //// console.log(value, emails)
            //// console.log(value)
            // const serverData = await LinodeServers.findById(value)
            // const {serverInfo, fakeDomain, fakeEmail} = serverData
            var serverData;
            var serverIP;
            var fakeDomain;
            var fakeEmail;

            serverData = await LinodeServers.findById(value);
            //console.log(serverData)
            if (serverData) {
              serverIP = serverData.serverInfo.ipv4[0];
              fakeDomain = serverData.fakeDomain;
              fakeEmail = serverData.fakeEmail;
            }
            if (!serverData) {
              serverData = await BitLaunchServers.findById(value);
              serverIP = serverData.serverInfo.ipv4;
              fakeDomain = serverData.fakeDomain;
              fakeEmail = serverData.fakeEmail;
            }

            if (!senderEmail) {
              var data = {
                titleForm: fakeDomain,
                subjectForm: subjectForm,
                senderEmail: fakeEmail,
                message: message,
                useSmtp: useSmtp,
                selectedTemplate: selectedTemplate,
                host: host,
                port: port,
                email_user: email_user,
                email_password: email_password,
                key: key,
                targetEmails: emails,
                server: serverIP,
                intervalTime: intervalTime,
                emailPerMail: emailPerMail,
                headers: myObj,
                tls: req.body.tls,
                ssl: ssl,
              };

              ////console.log(data)

              //// console.log(JSON.stringify(headers))

              axios
                .post(`http://${serverIP}:8001/api/run-emails`, data)
                .then((response) => {
                  //console.log('THE RESPONSE')
                })
                .catch((error) => {
                  //console.log('error 1')
                  //console.log(error)
                });
            } else {
              //// console.log('owo')
              var data = {
                titleForm: titleForm,
                subjectForm: subjectForm,
                senderEmail: senderEmail,
                message: message,
                useSmtp: useSmtp,
                selectedTemplate: selectedTemplate,
                host: host,
                port: port,
                email_user: email_user,
                email_password: email_password,
                key: key,
                targetEmails: emails,
                server: serverIP,
                intervalTime: intervalTime,
                emailPerMail: emailPerMail,
                headers: myObj,
                tls: req.body.tls,
                ssl: ssl,
              };

              ////console.log(data)

              axios
                .post(`http://${serverIP}:8001/api/run-emails`, data)
                .then((response) => {
                  //console.log('THE RESPONSE')
                })
                .catch((error) => {
                  //console.log('error 1')
                });
            }

            if (index === array.length - 1) resolve();
          });
        });

        bar.then(() => {
          res.status(200).send("Success");
        });
      } catch (error) {
        //console.log('error')
      }
    }
  }
};

exports.requestEmailProcessor = async (req, res) => {
  const {
    titleForm,
    senderEmail,
    subjectForm,
    message,
    useSmtp,
    selectedTemplate,
    host,
    port,
    email_user,
    email_password,
    key,
    targetEmails,
    intervalTime,
    emailPerMail,
    headers,
    ssl,
    tls,
    servers,
    manualTargetEmails,
  } = req.body;
  const myObj = req.body.headers;

  if (!servers || !intervalTime || !emailPerMail) {
    return res.status(400).send("Error. Please select a valid server");
  } else {
    let arrayOfServers = servers && servers.split(",");

    if (req.body.manualTargetEmails) {
      try {
        let cleanArr = [];
        let spaces = manualTargetEmails.split(" ");

        for (let i = 0; i < spaces.length; i++) {
          if (spaces[i].includes("\n")) {
            let clean = spaces[i].split("\n");
            for (let email of clean) {
              cleanArr.push(email);
            }
          } else {
            cleanArr.push(spaces[i]);
          }
        }

        const nServer = arrayOfServers.length;

        const chunks = (a, size) =>
          Array.from(new Array(Math.ceil(a.length / size)), (_, i) =>
            a.slice(i * size, i * size + size)
          );

        const resultShit = chunks(cleanArr, cleanArr.length / nServer);

        var bar = new Promise((resolve, reject) => {
          arrayOfServers.forEach(async (value, index, array) => {
            const emails = resultShit[index];
            //// console.log(value)

            var resultFindLinode = await LinodeServers.findById(value);
            if (resultFindLinode) {
              serverIP = resultFindLinode.serverInfo.ipv4[0];
              fakeDomain = resultFindLinode.fakeDomain;
              fakeEmail = resultFindLinode.fakeEmail;
            }
            var resultFindBitlaunch = await BitLaunchServers.findById(value);
            if (resultFindBitlaunch) {
              serverIP = resultFindBitlaunch.serverInfo.ipv4;
              fakeDomain = resultFindBitlaunch.fakeDomain;
              fakeEmail = resultFindBitlaunch.fakeEmail;
            }
            var resultFindCustom = await CustomServers.findById(value);
            if (resultFindCustom) {
              serverIP = resultFindCustom.serverInfo.ipv4;
              fakeDomain = resultFindCustom.fakeDomain;
              fakeEmail = resultFindCustom.fakeEmail;
            }
            var resultFindVultr = await VultrServers.findById(value);
            if (resultFindVultr) {
              serverIP = resultFindVultr.serverInfo.ipv4;
              fakeDomain = resultFindVultr.fakeDomain;
              fakeEmail = resultFindVultr.fakeEmail;
            }

            if (!senderEmail) {
              //console.log('epa loco 1')
              var data = {
                titleForm: fakeDomain,
                subjectForm: subjectForm,
                senderEmail: fakeEmail,
                message: message,
                useSmtp: useSmtp,
                selectedTemplate: selectedTemplate,
                host: host,
                port: port,
                email_user: email_user,
                email_password: email_password,
                key: key,
                targetEmails: emails,
                // "server":serverInfo.ipv4[0],
                server: serverIP,
                intervalTime: intervalTime,
                emailPerMail: emailPerMail,
                headers: myObj,
                tls: req.body.tls,
                ssl: ssl,
              };

              ////console.log(data)
              axios
                .post(`http://${serverIP}:8001/api/run-emails`, data)
                .then((response) => {
                  //console.log('THE RESPONSE')
                })
                .catch((error) => {
                  //console.log('error 1')
                });
            } else {
              //console.log('epa loco 2')
              var data = {
                titleForm: titleForm,
                subjectForm: subjectForm,
                senderEmail: senderEmail,
                message: message,
                useSmtp: useSmtp,
                selectedTemplate: selectedTemplate,
                host: host,
                port: port,
                email_user: email_user,
                email_password: email_password,
                key: key,
                targetEmails: emails,
                server: serverIP,
                intervalTime: intervalTime,
                emailPerMail: emailPerMail,
                headers: myObj,
                tls: req.body.tls,
                ssl: ssl,
              };
              ////console.log(data)

              axios
                .post(`http://${serverIP}:8001/api/run-emails`, data)
                .then((response) => {
                  //console.log('THE RESPONSE')
                })
                .catch((error) => {
                  //console.log('error 1')
                });
            }
            if (index === array.length - 1) resolve();
          });
        });

        bar.then(() => {
          res.status(200).send("Success");
        });
      } catch (error) {}
    } else {
      //this does not do the chunk thing xd
      //console.log('ay verga')
      try {
        const nServer = arrayOfServers.length;
        const chunks = (a, size) =>
          Array.from(new Array(Math.ceil(a.length / size)), (_, i) =>
            a.slice(i * size, i * size + size)
          );

        const resultShit = chunks(targetEmails, targetEmails.length / nServer);

        var bar = new Promise((resolve, reject) => {
          arrayOfServers.forEach(async (value, index, array) => {
            const emails = resultShit[index];
            //// console.log(value, emails)
            //// console.log(value)
            // const serverData = await LinodeServers.findById(value)
            // const {serverInfo, fakeDomain, fakeEmail} = serverData
            var serverData;
            var serverIP;
            var fakeDomain;
            var fakeEmail;

            serverData = await LinodeServers.findById(value);
            //console.log(serverData)
            if (serverData) {
              serverIP = serverData.serverInfo.ipv4[0];
              fakeDomain = serverData.fakeDomain;
              fakeEmail = serverData.fakeEmail;
            }
            if (!serverData) {
              serverData = await BitLaunchServers.findById(value);
              serverIP = serverData.serverInfo.ipv4;
              fakeDomain = serverData.fakeDomain;
              fakeEmail = serverData.fakeEmail;
            }

            if (!senderEmail) {
              var data = {
                titleForm: fakeDomain,
                subjectForm: subjectForm,
                senderEmail: fakeEmail,
                message: message,
                useSmtp: useSmtp,
                selectedTemplate: selectedTemplate,
                host: host,
                port: port,
                email_user: email_user,
                email_password: email_password,
                key: key,
                targetEmails: emails,
                server: serverIP,
                intervalTime: intervalTime,
                emailPerMail: emailPerMail,
                headers: myObj,
                tls: req.body.tls,
                ssl: ssl,
              };

              ////console.log(data)

              //// console.log(JSON.stringify(headers))

              axios
                .post(`http://${serverIP}:8001/api/run-emails`, data)
                .then((response) => {
                  //console.log('THE RESPONSE')
                })
                .catch((error) => {
                  //console.log('error 1')
                  //console.log(error)
                });
            } else {
              //// console.log('owo')
              var data = {
                titleForm: titleForm,
                subjectForm: subjectForm,
                senderEmail: senderEmail,
                message: message,
                useSmtp: useSmtp,
                selectedTemplate: selectedTemplate,
                host: host,
                port: port,
                email_user: email_user,
                email_password: email_password,
                key: key,
                targetEmails: emails,
                server: serverIP,
                intervalTime: intervalTime,
                emailPerMail: emailPerMail,
                headers: myObj,
                tls: req.body.tls,
                ssl: ssl,
              };

              ////console.log(data)

              axios
                .post(`http://${serverIP}:8001/api/run-emails`, data)
                .then((response) => {
                  //console.log('THE RESPONSE')
                })
                .catch((error) => {
                  //console.log('error 1')
                });
            }

            if (index === array.length - 1) resolve();
          });
        });

        bar.then(() => {
          res.status(200).send("Success");
        });
      } catch (error) {
        //console.log('error')
      }
    }
  }
};

exports.updateAllDigitalOcean = async (req, res) => {
  try {
    const digitalOceanData = await DigitalOceanSettings.find();
    if (!digitalOceanData.length) {
      return res.status(400).send([]);
    } else {
      const response = await axios.get(
        `https://api.digitalocean.com/v2/droplets?page=1&per_page=1`,
        {
          headers: {
            Authorization: `Bearer ${digitalOceanData[0].key}`,
            "Content-Type": "application/json",
          },
        }
      );
      const linodes = response.data.data;
      function runUpdate(obj) {
        return new Promise((resolve, reject) => {
          DigitalOceanServers.findOneAndUpdate(
            { "serverInfo.id": obj.id },
            { $set: { serverInfo: obj } }
          )
            .then((result) => resolve())
            .catch((err) => reject(err));
        });
      }

      let promiseArr = [];
      linodes.forEach((obj) => promiseArr.push(runUpdate(obj)));
      Promise.all(promiseArr)
        .then((res) => console.log("OK"))
        .catch((err) => console.log(res));

      return res.status(200).send(response.data);
    }
  } catch (error) {
    //console.log(error);
    return res.status(400).send("Error. Try Again");
  }
};

exports.updateAllLinodes = async (req, res) => {
  try {
    const linodeData = await LinodeSettings.find();
    if (!linodeData.lenght) {
      return res.send([]);
    } else {
      const response = await axios.get(
        `https://api.linode.com/v4/linode/instances?page=1&page_size=100`,
        {
          headers: {
            Authorization: `Bearer ${linodeData[0].key}`,
            "Content-Type": "application/json",
          },
        }
      );
      const linodes = response.data.data;
      function runUpdate(obj) {
        return new Promise((resolve, reject) => {
          LinodeServers.findOneAndUpdate(
            { "serverInfo.id": obj.id },
            { $set: { serverInfo: obj } }
          )
            .then((result) => resolve())
            .catch((err) => reject(err));
        });
      }

      let promiseArr = [];
      linodes.forEach((obj) => promiseArr.push(runUpdate(obj)));
      Promise.all(promiseArr)
        .then((res) => console.log("OK"))
        .catch((err) => console.log(res));

      return res.status(200).send(response.data);
    }
  } catch (error) {
    console.log(error);
    return res.status(400).send("Error. Try Again");
  }
};
exports.updateAllBitlaunch = async (req, res) => {
  try {
    const bitlaunchData = await BitlauchSettings.find();
    if (!bitlaunchData.length) {
      return res.send([]);
    } else {
      const response = await axios.get(`https://app.bitlaunch.io/api/servers`, {
        headers: {
          Authorization: `Bearer ${bitlaunchData[0].key}`,
          "Content-Type": "application/json",
        },
      });
      //console.log(response.data)
      const bitlaunchs = response.data;

      function runUpdate(obj) {
        return new Promise((resolve, reject) => {
          BitLaunchServers.findOneAndUpdate(
            { "serverInfo.id": obj.id },
            { $set: { serverInfo: obj } }
          )
            .then((result) => resolve())
            .catch((err) => reject(err));
        });
      }
      let promiseArr = [];
      bitlaunchs.forEach((obj) => promiseArr.push(runUpdate(obj)));
      Promise.all(promiseArr)
        .then((res) => console.log("OK"))
        .catch((err) => console.log(res));

      return res.status(200).send(bitlaunchs);
    }
  } catch (error) {
    console.log(error);
    return res.status(400).send("Error. Try Again");
  }
};
exports.updateAllVultr = async (req, res) => {
  try {
    const vultrData = await VultrSettings.find();
    if (!vultrData.length) {
      return res.send([]);
    } else {
      const response = await axios.get(`https://api.vultr.com/v2/instances`, {
        headers: {
          Authorization: `Bearer ${vultrData[0].key}`,
          "Content-Type": "application/json",
        },
      });
      //console.log(response.data)
      const vultrs = response.data;

      function runUpdate(obj) {
        return new Promise((resolve, reject) => {
          VultrServers.findOneAndUpdate(
            { "serverInfo.id": obj.id },
            { $set: { serverInfo: obj } }
          )
            .then((result) => resolve())
            .catch((err) => reject(err));
        });
      }
      let promiseArr = [];
      vultrs.forEach((obj) => promiseArr.push(runUpdate(obj)));
      Promise.all(promiseArr);
      //.then((res) => console.log('OK'))
      //.catch(err => console.log(res))

      return res.status(200).send(vultrs);
    }
  } catch (error) {
    //// console.log(error);
    return res.status(304).send("Error. Try Again");
  }
};

exports.installPackages = async (req, res) => {
  const id = req.params.id;

  //// console.log(id)
  const server = await LinodeServers.findById(req.params.id);
  ////console.log(server)

  // try {
  const ssh = new NodeSSH();
  const shit = await ssh
    .connect({
      // host: '45.56.104.31',
      host: server.serverInfo.ipv4[0],
      username: "root",
      password: "aComplexP@ssword",
    })
    .then(async function () {
      ssh
        .execCommand("sudo yum install git -y", { cwd: "/" })
        .then(function (result) {
          ////// console.log(result)
          ////console.log('1')
          if (result.stdout) {
            console.log("STDOUT: " + result.stdout);
          }
          //console.log('STDERR: ' + result.stderr)
          if (result.stderr) {
            console.log("STDERR: " + result.stderr);
          }
        })

        .then(async function () {
          ssh
            .execCommand("mkdir app", { cwd: "/" })
            .then(function (result) {
              ////// console.log(result)
              ////console.log('2')
              if (result.stdout) {
                console.log("STDOUT: " + result.stdout);
              }
              //console.log('STDERR: ' + result.stderr)
              if (result.stderr) {
                console.log("STDERR: " + result.stderr);
              }
            })
            .then(async function () {
              //probably we need to change Version of node
              ssh
                .execCommand(
                  "curl -sL https://rpm.nodesource.com/setup_10.x | sudo bash -",
                  { cwd: "/" }
                )
                .then(function (result) {
                  ////console.log(result)
                  ////console.log('3')
                  if (result.stdout) {
                    console.log("STDOUT: " + result.stdout);
                  }
                  //console.log('STDERR: ' + result.stderr)
                  if (result.stderr) {
                    console.log("STDERR: " + result.stderr);
                  }
                })
                .then(async function () {
                  ssh
                    .execCommand("sudo yum install nodejs -y", { cwd: "/" })
                    .then(function (result) {
                      ////console.log(result)
                      ////console.log('4')
                      if (result.stdout) {
                        console.log("STDOUT: " + result.stdout);
                      }
                      //console.log('STDERR: ' + result.stderr)
                      if (result.stderr) {
                        console.log("STDERR: " + result.stderr);
                      }
                    })
                    .then(async function () {
                      ssh
                        .execCommand(
                          'git clone "http://deploy:4sV3H8ZsBvev@172.104.239.163:3000/git/Email-Service.git"',
                          { cwd: "/app" }
                        )
                        .then(function (result) {
                          ////console.log(result)
                          ////console.log('5')
                          if (result.stdout) {
                            console.log("STDOUT: " + result.stdout);
                          }
                          //console.log('STDERR: ' + result.stderr)
                          if (result.stderr) {
                            console.log("STDERR: " + result.stderr);
                          }
                        })
                        .then(async function () {
                          ssh
                            .execCommand("npm i", { cwd: "/app/Email-Service" })
                            .then(function (result) {
                              ////console.log(result)
                              //////console.log('7')
                              if (result.stdout) {
                                console.log("STDOUT: " + result.stdout);
                              }
                              //console.log('STDERR: ' + result.stderr)
                              if (result.stderr) {
                                console.log("STDERR: " + result.stderr);
                              }
                            })
                            .then(async function () {
                              ssh
                                .execCommand(
                                  "firewall-cmd --permanent --zone=public --add-port=8001/tcp",
                                  { cwd: "/" }
                                )
                                .then(function (result) {
                                  ////console.log(result)
                                  //////console.log('7')
                                  if (result.stdout) {
                                    console.log("STDOUT: " + result.stdout);
                                  }
                                  //console.log('STDERR: ' + result.stderr)
                                  if (result.stderr) {
                                    console.log("STDERR: " + result.stderr);
                                  }
                                })
                                .then(async function () {
                                  ssh
                                    .execCommand(
                                      "systemctl restart firewalld ",
                                      { cwd: "/" }
                                    )
                                    .then(function (result) {
                                      ////console.log(result)
                                      //////console.log('7')
                                      if (result.stdout) {
                                        console.log("STDOUT: " + result.stdout);
                                      }
                                      //console.log('STDERR: ' + result.stderr)
                                      if (result.stderr) {
                                        console.log("STDERR: " + result.stderr);
                                      }
                                    })
                                    .then(async function () {
                                      ssh
                                        .execCommand(
                                          "mv /app/Email-Service/install/systemd_install /etc/systemd/system/emailer.service ",
                                          { cwd: "/" }
                                        )
                                        .then(function (result) {
                                          ////console.log(result)
                                          //////console.log('7')
                                          if (result.stdout) {
                                            console.log(
                                              "STDOUT: " + result.stdout
                                            );
                                          }
                                          //console.log('STDERR: ' + result.stderr)
                                          if (result.stderr) {
                                            console.log(
                                              "STDERR: " + result.stderr
                                            );
                                          }
                                        })
                                        .then(async function () {
                                          ssh
                                            .execCommand(
                                              "systemctl enable emailer.service",
                                              { cwd: "/" }
                                            )
                                            .then(function (result) {
                                              ////console.log(result)
                                              //////console.log('7')
                                              if (result.stdout) {
                                                console.log(
                                                  "STDOUT: " + result.stdout
                                                );
                                              }
                                              //console.log('STDERR: ' + result.stderr)
                                              if (result.stderr) {
                                                console.log(
                                                  "STDERR: " + result.stderr
                                                );
                                              }
                                            })
                                            .then(async function () {
                                              ssh
                                                .execCommand(
                                                  "systemctl start emailer.service",
                                                  { cwd: "/" }
                                                )
                                                .then(function (result) {
                                                  ////console.log(result)
                                                  //////console.log('7')
                                                  if (result.stdout) {
                                                    console.log(
                                                      "STDOUT: " + result.stdout
                                                    );
                                                  }
                                                  //console.log('STDERR: ' + result.stderr)
                                                  if (result.stderr) {
                                                    console.log(
                                                      "STDERR: " + result.stderr
                                                    );
                                                  }
                                                })
                                                .then(async function () {
                                                  ssh
                                                    .execCommand(
                                                      "npm -s run env echo '$npm_package_version'",
                                                      {
                                                        cwd: "/app/Email-Service",
                                                      }
                                                    )
                                                    .then(async function (
                                                      result
                                                    ) {
                                                      if (result.stdout) {
                                                        console.log(
                                                          "STDOUT: " +
                                                            result.stdout
                                                        );
                                                      }
                                                      //console.log('STDERR: ' + result.stderr)
                                                      if (result.stderr) {
                                                        console.log(
                                                          "STDERR: " +
                                                            result.stderr
                                                        );
                                                      }
                                                      const updatedServer =
                                                        await LinodeServers.findOneAndUpdate(
                                                          {
                                                            _id: req.params.id,
                                                          },
                                                          {
                                                            $set: {
                                                              softwareVersion:
                                                                result.stdout,
                                                            },
                                                          }
                                                        );
                                                      //console.log(updatedServer)
                                                      //console.log('ITS THE FINAL COUNTDOWN TIRURIRU')
                                                      // res.status(200).send('Success');
                                                    })
                                                    .then(async function () {
                                                      ssh
                                                        .execCommand(
                                                          "sudo yum install postfix",
                                                          { cwd: "/" }
                                                        )
                                                        .then(async function (
                                                          result
                                                        ) {
                                                          if (result.stdout) {
                                                            console.log(
                                                              "STDOUT: " +
                                                                result.stdout
                                                            );
                                                          }
                                                          //console.log('STDERR: ' + result.stderr)
                                                          if (result.stderr) {
                                                            console.log(
                                                              "STDERR: " +
                                                                result.stderr
                                                            );
                                                          }
                                                        })
                                                        .then(
                                                          async function () {
                                                            ssh
                                                              .execCommand(
                                                                "systemctl enable postfix",
                                                                { cwd: "/" }
                                                              )
                                                              .then(
                                                                async function (
                                                                  result
                                                                ) {
                                                                  if (
                                                                    result.stdout
                                                                  ) {
                                                                    console.log(
                                                                      "STDOUT: " +
                                                                        result.stdout
                                                                    );
                                                                  }
                                                                  //console.log('STDERR: ' + result.stderr)
                                                                  if (
                                                                    result.stderr
                                                                  ) {
                                                                    console.log(
                                                                      "STDERR: " +
                                                                        result.stderr
                                                                    );
                                                                  }
                                                                }
                                                              )
                                                              .then(
                                                                async function () {
                                                                  ssh
                                                                    .execCommand(
                                                                      "systemctl restart postfix",
                                                                      {
                                                                        cwd: "/",
                                                                      }
                                                                    )
                                                                    .then(
                                                                      async function (
                                                                        result
                                                                      ) {
                                                                        //console.log('now IT Is THE FINAL COUNTDOWN TIRURIRU')
                                                                        if (
                                                                          result.stdout
                                                                        ) {
                                                                          console.log(
                                                                            "STDOUT: " +
                                                                              result.stdout
                                                                          );
                                                                        }
                                                                        //console.log('STDERR: ' + result.stderr)
                                                                        if (
                                                                          result.stderr
                                                                        ) {
                                                                          console.log(
                                                                            "STDERR: " +
                                                                              result.stderr
                                                                          );
                                                                        }
                                                                        res
                                                                          .status(
                                                                            200
                                                                          )
                                                                          .send(
                                                                            "Success"
                                                                          );
                                                                      }
                                                                    );
                                                                }
                                                              );
                                                          }
                                                        );
                                                    });
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    })
    .catch((error) => {
      //console.log(error)
      return res.status(400).send("Error. Try Again");
    });
  // } catch (error) {
  ////   console.log(error);
  ////   return res.status(400).send('Error. Try Again');
  // }
};

exports.createCustomServer = async (req, res) => {
  if (!req.body.customPassword || !req.body.customIp) {
    return res.status(400).send("Fill all credentials");
  }

  var user;
  if (!req.body.customUsername) {
    user = "root";
  } else {
    user = req.body.customUsername;
  }

  var server = {
    ipv4: req.body.customIp,
    password: req.body.customPassword,
    username: user,
  };
  console.log(server);
  const ssh = new NodeSSH();
  const shit = await ssh
    .connect({
      // host: '45.56.104.31',
      host: server.ipv4,
      username: user,
      password: server.password,
    })
    .then(async function () {
      var firstName = fakerator.names.firstName();
      var lastName = fakerator.names.lastName();
      var space = " ";
      var fullName = firstName.concat(space, lastName);
      var fakeEmail = fakerator.internet.email(firstName, lastName);

      ////console.log(server)

      const customServer = new CustomServers({
        key: req.body.key,
        softwareVersion: "No software installed yet",
        serverInfo: server,
        fakeDomain: fullName,
        fakeEmail: fakeEmail,
      });
      const result = await customServer.save();

      console.log(result);

      return res.status(200).send("Success");
    })
    .catch((error) => {
      //console.log(error)
      return res.status(400).send("Error. Try Again");
    });
};

exports.installPackagesBitlaunch = async (req, res) => {
  //console.log(req.params.id)
  // res.status(200).send('Received');
  const server = await BitLaunchServers.findById(req.params.id);
  ////console.log(server)
  // try {
  const ssh = new NodeSSH();
  const shit = await ssh
    .connect({
      // host: '45.56.104.31',
      host: server.serverInfo.ipv4,
      username: "root",
      password: "aComplexP@ssword",
    })
    .then(async function () {
      ssh
        .execCommand("sudo yum install git -y", { cwd: "/" })
        .then(function (result) {
          ////// console.log(result)
          ////console.log('1')
          if (result.stdout) {
            console.log("STDOUT: " + result.stdout);
          }
          //console.log('STDERR: ' + result.stderr)
          if (result.stderr) {
            console.log("STDERR: " + result.stderr);
          }
        })

        .then(async function () {
          ssh
            .execCommand("mkdir app", { cwd: "/" })
            .then(function (result) {
              ////// console.log(result)
              ////console.log('2')
              if (result.stdout) {
                console.log("STDOUT: " + result.stdout);
              }
              //console.log('STDERR: ' + result.stderr)
              if (result.stderr) {
                console.log("STDERR: " + result.stderr);
              }
            })
            .then(async function () {
              //probably we need to change Version of node
              ssh
                .execCommand(
                  "curl -sL https://rpm.nodesource.com/setup_10.x | sudo bash -",
                  { cwd: "/" }
                )
                .then(function (result) {
                  ////console.log(result)
                  ////console.log('3')
                  if (result.stdout) {
                    console.log("STDOUT: " + result.stdout);
                  }
                  //console.log('STDERR: ' + result.stderr)
                  if (result.stderr) {
                    console.log("STDERR: " + result.stderr);
                  }
                })
                .then(async function () {
                  ssh
                    .execCommand("sudo yum install nodejs -y", { cwd: "/" })
                    .then(function (result) {
                      ////console.log(result)
                      ////console.log('4')
                      if (result.stdout) {
                        console.log("STDOUT: " + result.stdout);
                      }
                      //console.log('STDERR: ' + result.stderr)
                      if (result.stderr) {
                        console.log("STDERR: " + result.stderr);
                      }
                    })
                    .then(async function () {
                      ssh
                        .execCommand(
                          'git clone "http://deploy:4sV3H8ZsBvev@172.104.239.163:3000/git/Email-Service.git"',
                          { cwd: "/app" }
                        )
                        .then(function (result) {
                          ////console.log(result)
                          ////console.log('5')
                          if (result.stdout) {
                            console.log("STDOUT: " + result.stdout);
                          }
                          //console.log('STDERR: ' + result.stderr)
                          if (result.stderr) {
                            console.log("STDERR: " + result.stderr);
                          }
                        })
                        .then(async function () {
                          ssh
                            .execCommand("npm i", { cwd: "/app/Email-Service" })
                            .then(function (result) {
                              ////console.log(result)
                              //////console.log('7')
                              if (result.stdout) {
                                console.log("STDOUT: " + result.stdout);
                              }
                              //console.log('STDERR: ' + result.stderr)
                              if (result.stderr) {
                                console.log("STDERR: " + result.stderr);
                              }
                            })
                            .then(async function () {
                              ssh
                                .execCommand(
                                  "firewall-cmd --permanent --zone=public --add-port=8001/tcp",
                                  { cwd: "/" }
                                )
                                .then(function (result) {
                                  ////console.log(result)
                                  //////console.log('7')
                                  if (result.stdout) {
                                    console.log("STDOUT: " + result.stdout);
                                  }
                                  //console.log('STDERR: ' + result.stderr)
                                  if (result.stderr) {
                                    console.log("STDERR: " + result.stderr);
                                  }
                                })
                                .then(async function () {
                                  ssh
                                    .execCommand(
                                      "systemctl restart firewalld ",
                                      { cwd: "/" }
                                    )
                                    .then(function (result) {
                                      ////console.log(result)
                                      //////console.log('7')
                                      if (result.stdout) {
                                        console.log("STDOUT: " + result.stdout);
                                      }
                                      //console.log('STDERR: ' + result.stderr)
                                      if (result.stderr) {
                                        console.log("STDERR: " + result.stderr);
                                      }
                                    })
                                    .then(async function () {
                                      ssh
                                        .execCommand(
                                          "mv /app/Email-Service/install/systemd_install /etc/systemd/system/emailer.service ",
                                          { cwd: "/" }
                                        )
                                        .then(function (result) {
                                          ////console.log(result)
                                          //////console.log('7')
                                          if (result.stdout) {
                                            console.log(
                                              "STDOUT: " + result.stdout
                                            );
                                          }
                                          //console.log('STDERR: ' + result.stderr)
                                          if (result.stderr) {
                                            console.log(
                                              "STDERR: " + result.stderr
                                            );
                                          }
                                        })
                                        .then(async function () {
                                          ssh
                                            .execCommand(
                                              "systemctl enable emailer.service",
                                              { cwd: "/" }
                                            )
                                            .then(function (result) {
                                              ////console.log(result)
                                              //////console.log('7')
                                              if (result.stdout) {
                                                console.log(
                                                  "STDOUT: " + result.stdout
                                                );
                                              }
                                              //console.log('STDERR: ' + result.stderr)
                                              if (result.stderr) {
                                                console.log(
                                                  "STDERR: " + result.stderr
                                                );
                                              }
                                            })
                                            .then(async function () {
                                              ssh
                                                .execCommand(
                                                  "systemctl start emailer.service",
                                                  { cwd: "/" }
                                                )
                                                .then(function (result) {
                                                  ////console.log(result)
                                                  //////console.log('7')
                                                  if (result.stdout) {
                                                    console.log(
                                                      "STDOUT: " + result.stdout
                                                    );
                                                  }
                                                  //console.log('STDERR: ' + result.stderr)
                                                  if (result.stderr) {
                                                    console.log(
                                                      "STDERR: " + result.stderr
                                                    );
                                                  }
                                                })
                                                .then(async function () {
                                                  ssh
                                                    .execCommand(
                                                      "npm -s run env echo '$npm_package_version'",
                                                      {
                                                        cwd: "/app/Email-Service",
                                                      }
                                                    )
                                                    .then(async function (
                                                      result
                                                    ) {
                                                      if (result.stdout) {
                                                        console.log(
                                                          "STDOUT: " +
                                                            result.stdout
                                                        );
                                                      }
                                                      //console.log('STDERR: ' + result.stderr)
                                                      if (result.stderr) {
                                                        console.log(
                                                          "STDERR: " +
                                                            result.stderr
                                                        );
                                                      }
                                                      const updatedServer =
                                                        await BitLaunchServers.findOneAndUpdate(
                                                          {
                                                            _id: req.params.id,
                                                          },
                                                          {
                                                            $set: {
                                                              softwareVersion:
                                                                result.stdout,
                                                            },
                                                          }
                                                        );
                                                      //console.log(updatedServer)
                                                      //console.log('ITS THE FINAL COUNTDOWN TIRURIRU')
                                                      // res.status(200).send('Success');
                                                    })
                                                    .then(async function () {
                                                      ssh
                                                        .execCommand(
                                                          "sudo yum install postfix",
                                                          { cwd: "/" }
                                                        )
                                                        .then(async function (
                                                          result
                                                        ) {
                                                          if (result.stdout) {
                                                            console.log(
                                                              "STDOUT: " +
                                                                result.stdout
                                                            );
                                                          }
                                                          //console.log('STDERR: ' + result.stderr)
                                                          if (result.stderr) {
                                                            console.log(
                                                              "STDERR: " +
                                                                result.stderr
                                                            );
                                                          }
                                                        })
                                                        .then(
                                                          async function () {
                                                            ssh
                                                              .execCommand(
                                                                "systemctl enable postfix",
                                                                { cwd: "/" }
                                                              )
                                                              .then(
                                                                async function (
                                                                  result
                                                                ) {
                                                                  if (
                                                                    result.stdout
                                                                  ) {
                                                                    console.log(
                                                                      "STDOUT: " +
                                                                        result.stdout
                                                                    );
                                                                  }
                                                                  //console.log('STDERR: ' + result.stderr)
                                                                  if (
                                                                    result.stderr
                                                                  ) {
                                                                    console.log(
                                                                      "STDERR: " +
                                                                        result.stderr
                                                                    );
                                                                  }
                                                                }
                                                              )
                                                              .then(
                                                                async function () {
                                                                  ssh
                                                                    .execCommand(
                                                                      "systemctl restart postfix",
                                                                      {
                                                                        cwd: "/",
                                                                      }
                                                                    )
                                                                    .then(
                                                                      async function (
                                                                        result
                                                                      ) {
                                                                        //console.log('now IT Is THE FINAL COUNTDOWN TIRURIRU')
                                                                        if (
                                                                          result.stdout
                                                                        ) {
                                                                          console.log(
                                                                            "STDOUT: " +
                                                                              result.stdout
                                                                          );
                                                                        }
                                                                        //console.log('STDERR: ' + result.stderr)
                                                                        if (
                                                                          result.stderr
                                                                        ) {
                                                                          console.log(
                                                                            "STDERR: " +
                                                                              result.stderr
                                                                          );
                                                                        }
                                                                        res
                                                                          .status(
                                                                            200
                                                                          )
                                                                          .send(
                                                                            "Success"
                                                                          );
                                                                      }
                                                                    );
                                                                }
                                                              );
                                                          }
                                                        );
                                                    });
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    })
    .catch((error) => {
      //console.log(error)
      return res.status(400).send("Error. Try Again");
    });
};
exports.installPackagesVultr = async (req, res) => {
  //console.log(req.params.id)
  // res.status(200).send('Received');
  const server = await VultrServers.findById(req.params.id);
  ////console.log(server)
  // try {
  const ssh = new NodeSSH();
  const shit = await ssh
    .connect({
      // host: '45.56.104.31',
      host: server.serverInfo.ipv4,
      username: "root",
      password: "aComplexP@ssword",
    })
    .then(async function () {
      ssh
        .execCommand("sudo yum install git -y", { cwd: "/" })
        .then(function (result) {
          ////// console.log(result)
          ////console.log('1')
          if (result.stdout) {
            console.log("STDOUT: " + result.stdout);
          }
          //console.log('STDERR: ' + result.stderr)
          if (result.stderr) {
            console.log("STDERR: " + result.stderr);
          }
        })

        .then(async function () {
          ssh
            .execCommand("mkdir app", { cwd: "/" })
            .then(function (result) {
              ////// console.log(result)
              ////console.log('2')
              if (result.stdout) {
                console.log("STDOUT: " + result.stdout);
              }
              //console.log('STDERR: ' + result.stderr)
              if (result.stderr) {
                console.log("STDERR: " + result.stderr);
              }
            })
            .then(async function () {
              //probably we need to change Version of node
              ssh
                .execCommand(
                  "curl -sL https://rpm.nodesource.com/setup_10.x | sudo bash -",
                  { cwd: "/" }
                )
                .then(function (result) {
                  ////console.log(result)
                  ////console.log('3')
                  if (result.stdout) {
                    console.log("STDOUT: " + result.stdout);
                  }
                  //console.log('STDERR: ' + result.stderr)
                  if (result.stderr) {
                    console.log("STDERR: " + result.stderr);
                  }
                })
                .then(async function () {
                  ssh
                    .execCommand("sudo yum install nodejs -y", { cwd: "/" })
                    .then(function (result) {
                      ////console.log(result)
                      ////console.log('4')
                      if (result.stdout) {
                        console.log("STDOUT: " + result.stdout);
                      }
                      //console.log('STDERR: ' + result.stderr)
                      if (result.stderr) {
                        console.log("STDERR: " + result.stderr);
                      }
                    })
                    .then(async function () {
                      ssh
                        .execCommand(
                          'git clone "http://deploy:4sV3H8ZsBvev@172.104.239.163:3000/git/Email-Service.git"',
                          { cwd: "/app" }
                        )
                        .then(function (result) {
                          ////console.log(result)
                          ////console.log('5')
                          if (result.stdout) {
                            console.log("STDOUT: " + result.stdout);
                          }
                          //console.log('STDERR: ' + result.stderr)
                          if (result.stderr) {
                            console.log("STDERR: " + result.stderr);
                          }
                        })
                        .then(async function () {
                          ssh
                            .execCommand("npm i", { cwd: "/app/Email-Service" })
                            .then(function (result) {
                              ////console.log(result)
                              //////console.log('7')
                              if (result.stdout) {
                                console.log("STDOUT: " + result.stdout);
                              }
                              //console.log('STDERR: ' + result.stderr)
                              if (result.stderr) {
                                console.log("STDERR: " + result.stderr);
                              }
                            })
                            .then(async function () {
                              ssh
                                .execCommand(
                                  "firewall-cmd --permanent --zone=public --add-port=8001/tcp",
                                  { cwd: "/" }
                                )
                                .then(function (result) {
                                  ////console.log(result)
                                  //////console.log('7')
                                  if (result.stdout) {
                                    console.log("STDOUT: " + result.stdout);
                                  }
                                  //console.log('STDERR: ' + result.stderr)
                                  if (result.stderr) {
                                    console.log("STDERR: " + result.stderr);
                                  }
                                })
                                .then(async function () {
                                  ssh
                                    .execCommand(
                                      "systemctl restart firewalld ",
                                      { cwd: "/" }
                                    )
                                    .then(function (result) {
                                      ////console.log(result)
                                      //////console.log('7')
                                      if (result.stdout) {
                                        console.log("STDOUT: " + result.stdout);
                                      }
                                      //console.log('STDERR: ' + result.stderr)
                                      if (result.stderr) {
                                        console.log("STDERR: " + result.stderr);
                                      }
                                    })
                                    .then(async function () {
                                      ssh
                                        .execCommand(
                                          "mv /app/Email-Service/install/systemd_install /etc/systemd/system/emailer.service ",
                                          { cwd: "/" }
                                        )
                                        .then(function (result) {
                                          ////console.log(result)
                                          //////console.log('7')
                                          if (result.stdout) {
                                            console.log(
                                              "STDOUT: " + result.stdout
                                            );
                                          }
                                          //console.log('STDERR: ' + result.stderr)
                                          if (result.stderr) {
                                            console.log(
                                              "STDERR: " + result.stderr
                                            );
                                          }
                                        })
                                        .then(async function () {
                                          ssh
                                            .execCommand(
                                              "systemctl enable emailer.service",
                                              { cwd: "/" }
                                            )
                                            .then(function (result) {
                                              ////console.log(result)
                                              //////console.log('7')
                                              if (result.stdout) {
                                                console.log(
                                                  "STDOUT: " + result.stdout
                                                );
                                              }
                                              //console.log('STDERR: ' + result.stderr)
                                              if (result.stderr) {
                                                console.log(
                                                  "STDERR: " + result.stderr
                                                );
                                              }
                                            })
                                            .then(async function () {
                                              ssh
                                                .execCommand(
                                                  "systemctl start emailer.service",
                                                  { cwd: "/" }
                                                )
                                                .then(function (result) {
                                                  ////console.log(result)
                                                  //////console.log('7')
                                                  if (result.stdout) {
                                                    console.log(
                                                      "STDOUT: " + result.stdout
                                                    );
                                                  }
                                                  //console.log('STDERR: ' + result.stderr)
                                                  if (result.stderr) {
                                                    console.log(
                                                      "STDERR: " + result.stderr
                                                    );
                                                  }
                                                })
                                                .then(async function () {
                                                  ssh
                                                    .execCommand(
                                                      "npm -s run env echo '$npm_package_version'",
                                                      {
                                                        cwd: "/app/Email-Service",
                                                      }
                                                    )
                                                    .then(async function (
                                                      result
                                                    ) {
                                                      if (result.stdout) {
                                                        console.log(
                                                          "STDOUT: " +
                                                            result.stdout
                                                        );
                                                      }
                                                      //console.log('STDERR: ' + result.stderr)
                                                      if (result.stderr) {
                                                        console.log(
                                                          "STDERR: " +
                                                            result.stderr
                                                        );
                                                      }
                                                      const updatedServer =
                                                        await Vultr.findOneAndUpdate(
                                                          {
                                                            _id: req.params.id,
                                                          },
                                                          {
                                                            $set: {
                                                              softwareVersion:
                                                                result.stdout,
                                                            },
                                                          }
                                                        );
                                                      //console.log(updatedServer)
                                                      //console.log('ITS THE FINAL COUNTDOWN TIRURIRU')
                                                      // res.status(200).send('Success');
                                                    })
                                                    .then(async function () {
                                                      ssh
                                                        .execCommand(
                                                          "sudo yum install postfix",
                                                          { cwd: "/" }
                                                        )
                                                        .then(async function (
                                                          result
                                                        ) {
                                                          if (result.stdout) {
                                                            console.log(
                                                              "STDOUT: " +
                                                                result.stdout
                                                            );
                                                          }
                                                          //console.log('STDERR: ' + result.stderr)
                                                          if (result.stderr) {
                                                            console.log(
                                                              "STDERR: " +
                                                                result.stderr
                                                            );
                                                          }
                                                        })
                                                        .then(
                                                          async function () {
                                                            ssh
                                                              .execCommand(
                                                                "systemctl enable postfix",
                                                                { cwd: "/" }
                                                              )
                                                              .then(
                                                                async function (
                                                                  result
                                                                ) {
                                                                  if (
                                                                    result.stdout
                                                                  ) {
                                                                    console.log(
                                                                      "STDOUT: " +
                                                                        result.stdout
                                                                    );
                                                                  }
                                                                  //console.log('STDERR: ' + result.stderr)
                                                                  if (
                                                                    result.stderr
                                                                  ) {
                                                                    console.log(
                                                                      "STDERR: " +
                                                                        result.stderr
                                                                    );
                                                                  }
                                                                }
                                                              )
                                                              .then(
                                                                async function () {
                                                                  ssh
                                                                    .execCommand(
                                                                      "systemctl restart postfix",
                                                                      {
                                                                        cwd: "/",
                                                                      }
                                                                    )
                                                                    .then(
                                                                      async function (
                                                                        result
                                                                      ) {
                                                                        //console.log('now IT Is THE FINAL COUNTDOWN TIRURIRU')
                                                                        if (
                                                                          result.stdout
                                                                        ) {
                                                                          console.log(
                                                                            "STDOUT: " +
                                                                              result.stdout
                                                                          );
                                                                        }
                                                                        //console.log('STDERR: ' + result.stderr)
                                                                        if (
                                                                          result.stderr
                                                                        ) {
                                                                          console.log(
                                                                            "STDERR: " +
                                                                              result.stderr
                                                                          );
                                                                        }
                                                                        res
                                                                          .status(
                                                                            200
                                                                          )
                                                                          .send(
                                                                            "Success"
                                                                          );
                                                                      }
                                                                    );
                                                                }
                                                              );
                                                          }
                                                        );
                                                    });
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    })
    .catch((error) => {
      //console.log(error)
      return res.status(400).send("Error. Try Again");
    });
};
exports.installPackagesDigitalOcean = async (req, res) => {
  //console.log(req.params.id)
  // res.status(200).send('Received');
  const server = await DigitalOceanServers.findById(req.params.id);
  ////console.log(server)
  // try {
  const ssh = new NodeSSH();
  const shit = await ssh
    .connect({
      // host: '45.56.104.31',
      host: server.serverInfo.ipv4,
      username: "root",
      password: "aComplexP@ssword",
    })
    .then(async function () {
      ssh
        .execCommand("sudo yum install git -y", { cwd: "/" })
        .then(function (result) {
          ////// console.log(result)
          ////console.log('1')
          if (result.stdout) {
            console.log("STDOUT: " + result.stdout);
          }
          //console.log('STDERR: ' + result.stderr)
          if (result.stderr) {
            console.log("STDERR: " + result.stderr);
          }
        })

        .then(async function () {
          ssh
            .execCommand("mkdir app", { cwd: "/" })
            .then(function (result) {
              ////// console.log(result)
              ////console.log('2')
              if (result.stdout) {
                console.log("STDOUT: " + result.stdout);
              }
              //console.log('STDERR: ' + result.stderr)
              if (result.stderr) {
                console.log("STDERR: " + result.stderr);
              }
            })
            .then(async function () {
              //probably we need to change Version of node
              ssh
                .execCommand(
                  "curl -sL https://rpm.nodesource.com/setup_10.x | sudo bash -",
                  { cwd: "/" }
                )
                .then(function (result) {
                  ////console.log(result)
                  ////console.log('3')
                  if (result.stdout) {
                    console.log("STDOUT: " + result.stdout);
                  }
                  //console.log('STDERR: ' + result.stderr)
                  if (result.stderr) {
                    console.log("STDERR: " + result.stderr);
                  }
                })
                .then(async function () {
                  ssh
                    .execCommand("sudo yum install nodejs -y", { cwd: "/" })
                    .then(function (result) {
                      ////console.log(result)
                      ////console.log('4')
                      if (result.stdout) {
                        console.log("STDOUT: " + result.stdout);
                      }
                      //console.log('STDERR: ' + result.stderr)
                      if (result.stderr) {
                        console.log("STDERR: " + result.stderr);
                      }
                    })
                    .then(async function () {
                      ssh
                        .execCommand(
                          'git clone "http://deploy:4sV3H8ZsBvev@172.104.239.163:3000/git/Email-Service.git"',
                          { cwd: "/app" }
                        )
                        .then(function (result) {
                          ////console.log(result)
                          ////console.log('5')
                          if (result.stdout) {
                            console.log("STDOUT: " + result.stdout);
                          }
                          //console.log('STDERR: ' + result.stderr)
                          if (result.stderr) {
                            console.log("STDERR: " + result.stderr);
                          }
                        })
                        .then(async function () {
                          ssh
                            .execCommand("npm i", { cwd: "/app/Email-Service" })
                            .then(function (result) {
                              ////console.log(result)
                              //////console.log('7')
                              if (result.stdout) {
                                console.log("STDOUT: " + result.stdout);
                              }
                              //console.log('STDERR: ' + result.stderr)
                              if (result.stderr) {
                                console.log("STDERR: " + result.stderr);
                              }
                            })
                            .then(async function () {
                              ssh
                                .execCommand(
                                  "firewall-cmd --permanent --zone=public --add-port=8001/tcp",
                                  { cwd: "/" }
                                )
                                .then(function (result) {
                                  ////console.log(result)
                                  //////console.log('7')
                                  if (result.stdout) {
                                    console.log("STDOUT: " + result.stdout);
                                  }
                                  //console.log('STDERR: ' + result.stderr)
                                  if (result.stderr) {
                                    console.log("STDERR: " + result.stderr);
                                  }
                                })
                                .then(async function () {
                                  ssh
                                    .execCommand(
                                      "systemctl restart firewalld ",
                                      { cwd: "/" }
                                    )
                                    .then(function (result) {
                                      ////console.log(result)
                                      //////console.log('7')
                                      if (result.stdout) {
                                        console.log("STDOUT: " + result.stdout);
                                      }
                                      //console.log('STDERR: ' + result.stderr)
                                      if (result.stderr) {
                                        console.log("STDERR: " + result.stderr);
                                      }
                                    })
                                    .then(async function () {
                                      ssh
                                        .execCommand(
                                          "mv /app/Email-Service/install/systemd_install /etc/systemd/system/emailer.service ",
                                          { cwd: "/" }
                                        )
                                        .then(function (result) {
                                          ////console.log(result)
                                          //////console.log('7')
                                          if (result.stdout) {
                                            console.log(
                                              "STDOUT: " + result.stdout
                                            );
                                          }
                                          //console.log('STDERR: ' + result.stderr)
                                          if (result.stderr) {
                                            console.log(
                                              "STDERR: " + result.stderr
                                            );
                                          }
                                        })
                                        .then(async function () {
                                          ssh
                                            .execCommand(
                                              "systemctl enable emailer.service",
                                              { cwd: "/" }
                                            )
                                            .then(function (result) {
                                              ////console.log(result)
                                              //////console.log('7')
                                              if (result.stdout) {
                                                console.log(
                                                  "STDOUT: " + result.stdout
                                                );
                                              }
                                              //console.log('STDERR: ' + result.stderr)
                                              if (result.stderr) {
                                                console.log(
                                                  "STDERR: " + result.stderr
                                                );
                                              }
                                            })
                                            .then(async function () {
                                              ssh
                                                .execCommand(
                                                  "systemctl start emailer.service",
                                                  { cwd: "/" }
                                                )
                                                .then(function (result) {
                                                  ////console.log(result)
                                                  //////console.log('7')
                                                  if (result.stdout) {
                                                    console.log(
                                                      "STDOUT: " + result.stdout
                                                    );
                                                  }
                                                  //console.log('STDERR: ' + result.stderr)
                                                  if (result.stderr) {
                                                    console.log(
                                                      "STDERR: " + result.stderr
                                                    );
                                                  }
                                                })
                                                .then(async function () {
                                                  ssh
                                                    .execCommand(
                                                      "npm -s run env echo '$npm_package_version'",
                                                      {
                                                        cwd: "/app/Email-Service",
                                                      }
                                                    )
                                                    .then(async function (
                                                      result
                                                    ) {
                                                      if (result.stdout) {
                                                        console.log(
                                                          "STDOUT: " +
                                                            result.stdout
                                                        );
                                                      }
                                                      //console.log('STDERR: ' + result.stderr)
                                                      if (result.stderr) {
                                                        console.log(
                                                          "STDERR: " +
                                                            result.stderr
                                                        );
                                                      }
                                                      const updatedServer =
                                                        await DigitalOceanServers.findOneAndUpdate(
                                                          {
                                                            _id: req.params.id,
                                                          },
                                                          {
                                                            $set: {
                                                              softwareVersion:
                                                                result.stdout,
                                                            },
                                                          }
                                                        );
                                                      //console.log(updatedServer)
                                                      //console.log('ITS THE FINAL COUNTDOWN TIRURIRU')
                                                      // res.status(200).send('Success');
                                                    })
                                                    .then(async function () {
                                                      ssh
                                                        .execCommand(
                                                          "sudo yum install postfix",
                                                          { cwd: "/" }
                                                        )
                                                        .then(async function (
                                                          result
                                                        ) {
                                                          if (result.stdout) {
                                                            console.log(
                                                              "STDOUT: " +
                                                                result.stdout
                                                            );
                                                          }
                                                          //console.log('STDERR: ' + result.stderr)
                                                          if (result.stderr) {
                                                            console.log(
                                                              "STDERR: " +
                                                                result.stderr
                                                            );
                                                          }
                                                        })
                                                        .then(
                                                          async function () {
                                                            ssh
                                                              .execCommand(
                                                                "systemctl enable postfix",
                                                                { cwd: "/" }
                                                              )
                                                              .then(
                                                                async function (
                                                                  result
                                                                ) {
                                                                  if (
                                                                    result.stdout
                                                                  ) {
                                                                    console.log(
                                                                      "STDOUT: " +
                                                                        result.stdout
                                                                    );
                                                                  }
                                                                  //console.log('STDERR: ' + result.stderr)
                                                                  if (
                                                                    result.stderr
                                                                  ) {
                                                                    console.log(
                                                                      "STDERR: " +
                                                                        result.stderr
                                                                    );
                                                                  }
                                                                }
                                                              )
                                                              .then(
                                                                async function () {
                                                                  ssh
                                                                    .execCommand(
                                                                      "systemctl restart postfix",
                                                                      {
                                                                        cwd: "/",
                                                                      }
                                                                    )
                                                                    .then(
                                                                      async function (
                                                                        result
                                                                      ) {
                                                                        //console.log('now IT Is THE FINAL COUNTDOWN TIRURIRU')
                                                                        if (
                                                                          result.stdout
                                                                        ) {
                                                                          console.log(
                                                                            "STDOUT: " +
                                                                              result.stdout
                                                                          );
                                                                        }
                                                                        //console.log('STDERR: ' + result.stderr)
                                                                        if (
                                                                          result.stderr
                                                                        ) {
                                                                          console.log(
                                                                            "STDERR: " +
                                                                              result.stderr
                                                                          );
                                                                        }
                                                                        res
                                                                          .status(
                                                                            200
                                                                          )
                                                                          .send(
                                                                            "Success"
                                                                          );
                                                                      }
                                                                    );
                                                                }
                                                              );
                                                          }
                                                        );
                                                    });
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    })
    .catch((error) => {
      //console.log(error)
      return res.status(400).send("Error. Try Again");
    });
};

exports.installPackagesCustom = async (req, res) => {
  //console.log(req.params.id)
  // res.status(200).send('Received');
  const server = await CustomServers.findById(req.params.id);
  ////console.log(server)
  // try {
  const ssh = new NodeSSH();
  const shit = await ssh
    .connect({
      // host: '45.56.104.31',
      host: server.serverInfo.ipv4,
      username: server.serverInfo.username,
      password: server.serverInfo.password,
    })
    .then(async function () {
      ssh
        .execCommand("sudo yum install git -y", { cwd: "/" })
        .then(function (result) {
          ////// console.log(result)
          ////console.log('1')
          if (result.stdout) {
            console.log("STDOUT: " + result.stdout);
          }
          //console.log('STDERR: ' + result.stderr)
          if (result.stderr) {
            console.log("STDERR: " + result.stderr);
          }
        })

        .then(async function () {
          ssh
            .execCommand("mkdir app", { cwd: "/" })
            .then(function (result) {
              ////// console.log(result)
              ////console.log('2')
              if (result.stdout) {
                console.log("STDOUT: " + result.stdout);
              }
              //console.log('STDERR: ' + result.stderr)
              if (result.stderr) {
                console.log("STDERR: " + result.stderr);
              }
            })
            .then(async function () {
              //probably we need to change Version of node
              ssh
                .execCommand(
                  "curl -sL https://rpm.nodesource.com/setup_10.x | sudo bash -",
                  { cwd: "/" }
                )
                .then(function (result) {
                  ////console.log(result)
                  ////console.log('3')
                  if (result.stdout) {
                    console.log("STDOUT: " + result.stdout);
                  }
                  //console.log('STDERR: ' + result.stderr)
                  if (result.stderr) {
                    console.log("STDERR: " + result.stderr);
                  }
                })
                .then(async function () {
                  ssh
                    .execCommand("sudo yum install nodejs -y", { cwd: "/" })
                    .then(function (result) {
                      ////console.log(result)
                      ////console.log('4')
                      if (result.stdout) {
                        console.log("STDOUT: " + result.stdout);
                      }
                      //console.log('STDERR: ' + result.stderr)
                      if (result.stderr) {
                        console.log("STDERR: " + result.stderr);
                      }
                    })
                    .then(async function () {
                      ssh
                        .execCommand(
                          'git clone "http://deploy:4sV3H8ZsBvev@172.104.239.163:3000/git/Email-Service.git"',
                          { cwd: "/app" }
                        )
                        .then(function (result) {
                          ////console.log(result)
                          ////console.log('5')
                          if (result.stdout) {
                            console.log("STDOUT: " + result.stdout);
                          }
                          //console.log('STDERR: ' + result.stderr)
                          if (result.stderr) {
                            console.log("STDERR: " + result.stderr);
                          }
                        })
                        .then(async function () {
                          ssh
                            .execCommand("npm i", { cwd: "/app/Email-Service" })
                            .then(function (result) {
                              ////console.log(result)
                              //////console.log('7')
                              if (result.stdout) {
                                console.log("STDOUT: " + result.stdout);
                              }
                              //console.log('STDERR: ' + result.stderr)
                              if (result.stderr) {
                                console.log("STDERR: " + result.stderr);
                              }
                            })
                            .then(async function () {
                              ssh
                                .execCommand(
                                  "firewall-cmd --permanent --zone=public --add-port=8001/tcp",
                                  { cwd: "/" }
                                )
                                .then(function (result) {
                                  ////console.log(result)
                                  //////console.log('7')
                                  if (result.stdout) {
                                    console.log("STDOUT: " + result.stdout);
                                  }
                                  //console.log('STDERR: ' + result.stderr)
                                  if (result.stderr) {
                                    console.log("STDERR: " + result.stderr);
                                  }
                                })
                                .then(async function () {
                                  ssh
                                    .execCommand(
                                      "systemctl restart firewalld ",
                                      { cwd: "/" }
                                    )
                                    .then(function (result) {
                                      ////console.log(result)
                                      //////console.log('7')
                                      if (result.stdout) {
                                        console.log("STDOUT: " + result.stdout);
                                      }
                                      //console.log('STDERR: ' + result.stderr)
                                      if (result.stderr) {
                                        console.log("STDERR: " + result.stderr);
                                      }
                                    })
                                    .then(async function () {
                                      ssh
                                        .execCommand(
                                          "mv /app/Email-Service/install/systemd_install /etc/systemd/system/emailer.service ",
                                          { cwd: "/" }
                                        )
                                        .then(function (result) {
                                          ////console.log(result)
                                          //////console.log('7')
                                          if (result.stdout) {
                                            console.log(
                                              "STDOUT: " + result.stdout
                                            );
                                          }
                                          //console.log('STDERR: ' + result.stderr)
                                          if (result.stderr) {
                                            console.log(
                                              "STDERR: " + result.stderr
                                            );
                                          }
                                        })
                                        .then(async function () {
                                          ssh
                                            .execCommand(
                                              "systemctl enable emailer.service",
                                              { cwd: "/" }
                                            )
                                            .then(function (result) {
                                              ////console.log(result)
                                              //////console.log('7')
                                              if (result.stdout) {
                                                console.log(
                                                  "STDOUT: " + result.stdout
                                                );
                                              }
                                              //console.log('STDERR: ' + result.stderr)
                                              if (result.stderr) {
                                                console.log(
                                                  "STDERR: " + result.stderr
                                                );
                                              }
                                            })
                                            .then(async function () {
                                              ssh
                                                .execCommand(
                                                  "systemctl start emailer.service",
                                                  { cwd: "/" }
                                                )
                                                .then(function (result) {
                                                  ////console.log(result)
                                                  //////console.log('7')
                                                  if (result.stdout) {
                                                    console.log(
                                                      "STDOUT: " + result.stdout
                                                    );
                                                  }
                                                  //console.log('STDERR: ' + result.stderr)
                                                  if (result.stderr) {
                                                    console.log(
                                                      "STDERR: " + result.stderr
                                                    );
                                                  }
                                                })
                                                .then(async function () {
                                                  ssh
                                                    .execCommand(
                                                      "npm -s run env echo '$npm_package_version'",
                                                      {
                                                        cwd: "/app/Email-Service",
                                                      }
                                                    )
                                                    .then(async function (
                                                      result
                                                    ) {
                                                      if (result.stdout) {
                                                        console.log(
                                                          "STDOUT: " +
                                                            result.stdout
                                                        );
                                                      }
                                                      //console.log('STDERR: ' + result.stderr)
                                                      if (result.stderr) {
                                                        console.log(
                                                          "STDERR: " +
                                                            result.stderr
                                                        );
                                                      }
                                                      const updatedServer =
                                                        await CustomServers.findOneAndUpdate(
                                                          {
                                                            _id: req.params.id,
                                                          },
                                                          {
                                                            $set: {
                                                              softwareVersion:
                                                                result.stdout,
                                                            },
                                                          }
                                                        );
                                                      //console.log(updatedServer)
                                                      //console.log('ITS THE FINAL COUNTDOWN TIRURIRU')
                                                      // res.status(200).send('Success');
                                                    })
                                                    .then(async function () {
                                                      ssh
                                                        .execCommand(
                                                          "sudo yum install postfix",
                                                          { cwd: "/" }
                                                        )
                                                        .then(async function (
                                                          result
                                                        ) {
                                                          if (result.stdout) {
                                                            console.log(
                                                              "STDOUT: " +
                                                                result.stdout
                                                            );
                                                          }
                                                          //console.log('STDERR: ' + result.stderr)
                                                          if (result.stderr) {
                                                            console.log(
                                                              "STDERR: " +
                                                                result.stderr
                                                            );
                                                          }
                                                        })
                                                        .then(
                                                          async function () {
                                                            ssh
                                                              .execCommand(
                                                                "systemctl enable postfix",
                                                                { cwd: "/" }
                                                              )
                                                              .then(
                                                                async function (
                                                                  result
                                                                ) {
                                                                  if (
                                                                    result.stdout
                                                                  ) {
                                                                    console.log(
                                                                      "STDOUT: " +
                                                                        result.stdout
                                                                    );
                                                                  }
                                                                  //console.log('STDERR: ' + result.stderr)
                                                                  if (
                                                                    result.stderr
                                                                  ) {
                                                                    console.log(
                                                                      "STDERR: " +
                                                                        result.stderr
                                                                    );
                                                                  }
                                                                }
                                                              )
                                                              .then(
                                                                async function () {
                                                                  ssh
                                                                    .execCommand(
                                                                      "systemctl restart postfix",
                                                                      {
                                                                        cwd: "/",
                                                                      }
                                                                    )
                                                                    .then(
                                                                      async function (
                                                                        result
                                                                      ) {
                                                                        //console.log('now IT Is THE FINAL COUNTDOWN TIRURIRU')
                                                                        if (
                                                                          result.stdout
                                                                        ) {
                                                                          console.log(
                                                                            "STDOUT: " +
                                                                              result.stdout
                                                                          );
                                                                        }
                                                                        //console.log('STDERR: ' + result.stderr)
                                                                        if (
                                                                          result.stderr
                                                                        ) {
                                                                          console.log(
                                                                            "STDERR: " +
                                                                              result.stderr
                                                                          );
                                                                        }
                                                                        res
                                                                          .status(
                                                                            200
                                                                          )
                                                                          .send(
                                                                            "Success"
                                                                          );
                                                                      }
                                                                    );
                                                                }
                                                              );
                                                          }
                                                        );
                                                    });
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    })
    .catch((error) => {
      //console.log(error)
      return res.status(400).send("Error. Try Again");
    });
};

exports.saveEmailResults = async (req, res) => {
  const resultArr = req.body;

  var bar = new Promise((resolve, reject) => {
    resultArr.forEach(async (value, index, array) => {
      //// console.log(value)
      var wasAccepted = null;
      var error = null;
      if (value.result.accepted.length === 0) {
        wasAccepted = false;
        error = true;
      } else {
        wasAccepted = true;
        error = false;
      }

      //console.log(value.result.envelope.to)

      const newEntry = new EmailSended({
        to: value.result.envelope.to,
        from: value.result.envelope.from,
        error: error,
        accepted: wasAccepted,
        server: value.server,
        subject: value.subject,
        message: value.message,
      });

      const query = await newEntry.save();

      //// console.log(query)

      if (index === array.length - 1) resolve();
    });
  });

  bar.then(() => {
    res.status(200).send("Success");
  });

  // const {result, server, subject, message} = req.body

  //// console.log('hey bro :d')
  // var wasAccepted = null;
  // var error = null;
  // if (result.accepted.length === 0) {
  //   wasAccepted = false;
  //   error = true
  // }else {
  //   wasAccepted = true;
  //   error = false
  // }

  // const newEntry = new EmailSended({ to:result.envelope.to, from: result.envelope.from,
  //    error: error, accepted: wasAccepted, server:server, subject:subject, message:message })

  // const query = await newEntry.save()
};
