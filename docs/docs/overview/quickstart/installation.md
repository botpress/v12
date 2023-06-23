---
id: installation
title: Installation
---

---

Getting started with Botpress is easy. We build and distribute binaries of the latest stable version and nightly builds of the Github master branch and also have a Desktop app.

## Quick Install

This option provides standard installation without any specific customization or advanced configuration and is the recommended straightforward way to download and install the latest version of Botpress.

Head over to the [**download page**](https://botpress.com/download). Download and install the latest Botpress version according to your operating system.
If you are using Linux, you must use the `sudo snap install Botpress_VERSION_NUMBER.snap --force-dangerous` command. You can then load Botpress by searching for the app on your operating system.
 
## Alternative - Download Binaries

This option is useful if you want to run Botpress with special parameters, customize it for server environments, or use it in lightweight Linux desktop environments. <!-- What is special if I download the latest from the download page here? -->

Download the latest stable binaries from the [**download page**](https://botpress.com/download). You can also find all versions and nightly builds in our public [**S3 Bucket**](https://s3.amazonaws.com/botpress-binaries/index.html).

## Alternative - Install Binaries
<!-- Shouldn't this be "Install Botpress" isn't that required for both the quick install and the binaries? -->

To install Botpress, unzip the file you download somewhere on your computer. Make sure that your computer has at least:

- Memory (RAM): Recommended 4 GB or above;
- Hard Drive: Recommended 64 GB of free space or above;
- A 64 bits architecture;
- The right to read/write to the Botpress directory and subdirectories.

## Alternative - Starting Botpress Binaries
<!-- as above. Shouldn't this be "Starting Botpress" isn't that required for both the quick install and the binaries? -->

To start Botpress, double-click on the `bp` file in the directory you extracted Botpress.

Alternatively, start Botpress from the terminal using the command:

```bash
./bp
```

To see all the commands available, run `./bp --help`.

![CLI Start](/assets/cli-help.png)

:::note
The first time you run Botpress, the built-in modules take some time to install. Subsequent runs will be faster.
:::

Once the modules are installed and loaded, you will end up with something similar to the console log below:

```bash
User@DESKTOP-T1ORLFU MINGW64 /c/BotpressBinary/botpress-v12_22_0-win-x64
$ ./bp
06/02/2021 07:24:26.522 Launcher ========================================
                                             Botpress Server
                                             Version 12.22.0
                                                 OS win32
                                 ========================================
06/02/2021 07:24:26.524 Launcher App Data Dir: "C:\Users\botpress"
06/02/2021 07:24:26.528 Launcher Using 10 modules
                        ⦿ analytics
                        ⦿ basic-skills
                        ⦿ builtin
                        ⦿ channel-web
                        ⦿ code-editor
                        ⦿ examples
                        ⦿ extensions
                        ⦿ nlu
                        ⦿ qna
                        ⦿ testing
                        ⊝ bot-improvement (disabled)
                        ⊝ broadcast (disabled)
                        ⊝ channel-messenger (disabled)
                        ⊝ channel-slack (disabled)
                        ⊝ channel-smooch (disabled)
                        ⊝ channel-teams (disabled)
                        ⊝ channel-telegram (disabled)
                        ⊝ channel-twilio (disabled)
                        ⊝ channel-vonage (disabled)
                        ⊝ google-speech (disabled)
                        ⊝ hitl (disabled)
                        ⊝ hitlnext (disabled)
                        ⊝ libraries (disabled)
                        ⊝ misunderstood (disabled)
                        ⊝ ndu (disabled)
                        ⊝ nlu-testing (disabled)
                        ⊝ uipath (disabled)
06/02/2021 07:24:26.529 Server Running in DEVELOPMENT MODE
06/02/2021 07:24:27.047 Server Loaded 10 modules
06/02/2021 07:24:27.299 CMS Loaded 10 content types
06/02/2021 07:24:27.303 Server Botpress Pro must be enabled to use a custom theme and customize the branding.
06/02/2021 07:24:27.859 HTTP External URL is not configured. Using default value of http://localhost:3000. Some features may not work properly
06/02/2021 07:24:27.869 Server Discovered 0 bots
06/02/2021 07:24:27.870 Server Local Action Server will only run in experimental mode
06/02/2021 07:24:27.927 Server Started in 1398ms
06/02/2021 07:24:27.928 Launcher Botpress is listening at: http://localhost:3000
06/02/2021 07:24:27.928 Launcher Botpress is exposed at: http://localhost:3000
06/02/2021 07:24:29.761 launcher ========================================
                                               Botpress Standalone NLU
                                                    Version 0.0.2
                                 ========================================
06/02/2021 07:24:29.762 launcher Loading config from environment variables
06/02/2021 07:24:29.763 launcher authToken: enabled (only users with this token can query your server)
06/02/2021 07:24:29.763 launcher limit: disabled (no protection - anyone can query without limitation)
06/02/2021 07:24:29.763 launcher duckling: enabled url=http://localhost:8000
06/02/2021 07:24:29.764 launcher lang server: url=http://localhost:3100
06/02/2021 07:24:29.764 launcher body size: allowing HTTP resquests body of size 2mb
06/02/2021 07:24:29.764 launcher models stored at "C:\BotpressBinary\botpress-v12_22_0-win-x64"
06/02/2021 07:24:29.764 launcher batch size: allowing up to 1 predictions in one call to POST /predict
06/02/2021 07:24:29.912 launcher NLU Server is ready at http://localhost:3200/
```



## Learn More

Here is a video tutorial to help you set up Botpress. Slow the video down a bit to follow along.

- [Setting up on Windows](https://youtu.be/xf246NQyMj4)
- [Setting up on Mac](https://youtu.be/SBv0QOXyHL4)
- [Setting up on Linux](https://youtu.be/89RJx0kQyKM)
