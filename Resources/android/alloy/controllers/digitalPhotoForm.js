function __processArg(obj, key) {
    var arg = null;
    if (obj) {
        arg = obj[key] || null;
        delete obj[key];
    }
    return arg;
}

function Controller() {
    function showOptions() {
        $.imgSrc.setEnabled(false);
        var opts = {
            title: "Select"
        };
        opts.options = [ "Camera", "Photo Gallery", "Cancel" ];
        opts.buttonNames = [ "Help" ];
        opts.cancel = 2;
        var scanOptionDialog = Ti.UI.createOptionDialog(opts);
        scanOptionDialog.show();
        scanOptionDialog.addEventListener("click", function(event) {
            if (0 == event.index) {
                Titanium.API.info("Camera");
                Titanium.Media.showCamera({
                    success: function(event) {
                        Ti.API.debug("Our type was: " + event.mediaType);
                        Ti.API.debug("Media is: " + event);
                        Ti.API.debug("Media is: " + JSON.stringify(event));
                        if (event.mediaType == Ti.Media.MEDIA_TYPE_PHOTO) {
                            try {
                                var imageCorrection = Alloy.Globals.rotateAndResize(event.media, event.media.width, 100);
                                userImage = imageCorrection.read();
                                digitalPhotoMimeType = userImage.mimeType;
                                $.imgSrc.setTitle("Change Image");
                                alert("An image has been captured!");
                            } catch (e) {
                                alert("Unexpected error: " + e.code);
                            }
                        } else alert("got the wrong type back =" + event.mediaType);
                    },
                    cancel: function() {
                        Ti.UI.createNotification({
                            message: "Abort adding in picture from gallery",
                            duration: Ti.UI.NOTIFICATION_DURATION_SHORT
                        }).show();
                    },
                    error: function(error) {
                        var a = Titanium.UI.createAlertDialog({
                            title: "Camera"
                        });
                        if (error.code != Titanium.Media.NO_CAMERA) {
                            a.setMessage("Unexpected error: " + error.code);
                            return;
                        }
                        a.setMessage("Please run this test on device");
                        a.show();
                    },
                    saveToPhotoGallery: false,
                    mediaTypes: [ Ti.Media.MEDIA_TYPE_PHOTO ]
                });
            } else 1 == event.index ? Ti.Media.openPhotoGallery({
                success: function(event) {
                    if (event.mediaType == Ti.Media.MEDIA_TYPE_PHOTO) {
                        userImage = null;
                        try {
                            var imageCorrection = Alloy.Globals.rotateAndResize(event.media, event.media.width, 100);
                            imageCorrection && Ti.API.info("Corrected Blob Issue: " + imageCorrection.read() + " " + imageCorrection.read().mimeType);
                            var imageBlob = imageCorrection.read();
                            Ti.API.debug("Our api name was: " + event.mediaType);
                            Ti.API.debug("image url: " + imageBlob.mimeType);
                            Ti.API.debug("image height: " + imageBlob.height);
                            Ti.API.debug("image width: " + imageBlob.width);
                            Ti.API.debug("image file: " + imageBlob.file);
                            if ("image/jpeg" === event.media.mimeType) {
                                Ti.API.info("jpeg: " + event.media);
                                userImage = imageBlob;
                                Alloy.Globals.base64Check(userImage);
                                digitalPhotoMimeType = userImage.mimeType;
                                $.imgSrc.setTitle("Change Image");
                                alert("File added. Load times vary based on connection speed.");
                            } else {
                                userImage = imageBlob;
                                digitalPhotoMimeType = userImage.mimeType;
                                $.imgSrc.setTitle("Change Image");
                                alert("File added. Load times vary based on connection speed.!");
                            }
                        } catch (e) {
                            alert("Unexpected error: " + JSON.stringify(e));
                            return;
                        }
                    } else alert("You selected an invalid file. Please try a different photo." + event.mediaType);
                },
                cancel: function() {
                    Ti.UI.createNotification({
                        message: "Abort adding in picture from gallery",
                        duration: Ti.UI.NOTIFICATION_DURATION_SHORT
                    }).show();
                },
                error: function(error) {
                    var a = Titanium.UI.createAlertDialog({
                        title: "Photo Gallery"
                    });
                    error.code == Titanium.Media.NO_CAMERA ? a.setMessage("Please run this test on device") : a.setMessage("Unexpected error: " + error.code);
                    a.show();
                },
                saveToPhotoGallery: false,
                mediaTypes: Ti.Media.MEDIA_TYPE_PHOTO
            }) : Ti.UI.createNotification({
                message: "Abort adding in picture from gallery",
                duration: Ti.UI.NOTIFICATION_DURATION_SHORT
            }).show();
        });
        scanOptionDialog = null;
        $.imgSrc.setEnabled(true);
    }
    function submit(e) {
        if ("" === $.arti.value || "" === $.TitleLabelTA.value || "" === $.photoPlaceTA.value || "" === $.photoNameTA.value || "" === $.photoNameFTA.value || "" === $.photoNotesTA.value) alert("You must fill out all the required fields to submit!"); else if (userImage) {
            var fullName;
            var Name = $.photoNameTA.value.split(" ");
            fullName = " " != Name[0] || " " != Name[1] ? $.photoNameTA.value.split(" ") : $.photoNameTA.value;
            var fileExt = userImage.file.name;
            fileExt = "." + fileExt.substr(fileExt.lastIndexOf(".") + 1);
            Ti.API.info("File Extension " + fileExt);
            var currentData = {
                userPhoto: userImage,
                submitType: "Upload Image",
                resourceType: "Digital Photograph",
                photoStepNumber: 3,
                photoFirstName: $.photoNameFTA.value,
                photoLastName: $.photoNameTA.value,
                photoLanguage: "EN",
                photoPlace: $.photoPlaceTA.value,
                photoRights: "I have the permission of the rights owner to make this resource available through this repository.",
                photoEventName: $.photoEventNameTA.value,
                photoMemberType: "No Membership",
                photoPeopleNames: $.photoPeopleNameTA.value,
                photoOrg: $.photoOrgTA.value,
                photoModel: $.photoMakeTA.value,
                photoNotes: $.photoNotesTA.value,
                photoTitle: $.TitleLabelTA.value,
                photoDate: $.arti.value,
                mimeType: digitalPhotoMimeType,
                fileExtension: fileExt
            };
            data.setData(currentData);
            var args = {
                customDate: $.arti.value,
                customImage: currentData["userPhoto"],
                photoFullName: fullName,
                thisTitle: $.Title.text,
                photoDate: $.arti.value,
                photoFirstName: $.photoNameFTA.value,
                photoLastName: $.photoNameTA.value,
                photoPlace: $.photoPlaceTA.value,
                photoEventName: $.photoEventNameTA.value,
                photoPeopleNames: $.photoPeopleNameTA.value,
                photoOrg: $.photoOrgTA.value,
                photoModel: $.photoMakeTA.value,
                photoNotes: $.photoNotesTA.value,
                photoTitle: $.TitleLabelTA.value
            };
            submissionPageController = Alloy.createController("submissionPage", args).getView();
            submissionPageController.open();
            submissionPageController = null;
        } else alert("You need to select an image to submit!");
    }
    function helpSubmit(e) {
        console.log("Args: " + JSON.stringify(e));
        var args = {
            thisTitle: $.Title.text,
            thisDate: $.photoDateLabel.text,
            thisItem: $.TitleLabel.text,
            thisPlace: $.photoPlace.text,
            thisFirstName: $.photoNameF.text,
            thisName: $.photoName.text,
            thisPerson: $.photoPeopleName.text,
            thisEvent: $.photoEventName.text,
            thisOrg: $.photoOrg.text,
            thisMake: $.photoMake.text,
            thisNote: $.photoNotes.text,
            thisButtonID: e.source.id
        };
        console.log("In digi, helpsubmit: " + args.thisTitle);
        console.log("View ARG helpSubmit:" + JSON.stringify(args));
        alertController = Alloy.createController("helpNote", args).getView();
        alertController.open();
    }
    function backButton(e) {
        $.photoWin.close();
    }
    require("/alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "digitalPhotoForm";
    this.args = arguments[0] || {};
    if (arguments[0]) {
        __processArg(arguments[0], "__parentSymbol");
        __processArg(arguments[0], "$model");
        __processArg(arguments[0], "__itemTemplate");
    }
    var $ = this;
    var exports = {};
    var __defers = {};
    $.__views.photoWin = Ti.UI.createWindow({
        orientationModes: [ Ti.UI.PORTRAIT ],
        height: Titanium.UI.FILL,
        width: Titanium.UI.FILL,
        title: "Digital Photograph",
        backgroundColor: "#f2f2f2",
        windowSoftInputMode: Titanium.UI.Android.SOFT_INPUT_STATE_HIDDEN,
        id: "photoWin",
        theme: "mytheme"
    });
    $.__views.photoWin && $.addTopLevelView($.__views.photoWin);
    $.__views.navBar = Ti.UI.createView({
        backgroundColor: "black",
        top: "0%",
        width: "100%",
        height: "15%",
        font: {
            fontSize: 14
        },
        zIndex: 0,
        id: "navBar"
    });
    $.__views.photoWin.add($.__views.navBar);
    $.__views.back = Ti.UI.createButton({
        font: {
            fontFamily: "queensfoundationfont",
            fontSize: 35
        },
        textAlign: Titanium.UI.TEXT_ALIGNMENT_CENTER,
        color: "white",
        left: "5%",
        backgroundColor: "transparent",
        borderColor: "transparent",
        top: "0%",
        title: "T",
        id: "back"
    });
    $.__views.navBar.add($.__views.back);
    backButton ? $.addListener($.__views.back, "click", backButton) : __defers["$.__views.back!click!backButton"] = true;
    $.__views.QL = Ti.UI.createImageView({
        width: "33%",
        top: "13%",
        id: "QL",
        image: "QL300.png"
    });
    $.__views.navBar.add($.__views.QL);
    $.__views.titleBan = Ti.UI.createView({
        backgroundColor: "white",
        top: "7%",
        height: "15%",
        font: {
            fontSize: 12
        },
        id: "titleBan"
    });
    $.__views.photoWin.add($.__views.titleBan);
    $.__views.qp = Ti.UI.createImageView({
        top: "12%",
        width: "30%",
        left: "7%",
        id: "qp",
        image: "QM_FINAL_outlines.png"
    });
    $.__views.titleBan.add($.__views.qp);
    $.__views.Title = Ti.UI.createLabel({
        font: {
            fontSize: 18,
            fontFamily: "Montserrat-Regular",
            fontStyle: "",
            fontWeight: "bold"
        },
        color: "black",
        textAlign: "Titanium.UI.TEXT_ALIGNMENT_RIGHT",
        top: "25%",
        right: "5%",
        text: "Digital Photo",
        id: "Title"
    });
    $.__views.titleBan.add($.__views.Title);
    $.__views.__alloyId71 = Ti.UI.createScrollView({
        top: "18%",
        backgroundColor: "#e6e6e6",
        showVerticalScrollIndicator: "true",
        width: Titanium.UI.FILL,
        bottom: "0%",
        contentHeight: Titanium.UI.SIZE,
        contentWidth: "auto",
        layout: "vertical",
        scrollType: "vertical",
        id: "__alloyId71"
    });
    $.__views.photoWin.add($.__views.__alloyId71);
    $.__views.pickerView = Ti.UI.createView({
        top: "0%",
        backgroundColor: "transparent",
        height: "300dp",
        width: "100%",
        id: "pickerView"
    });
    $.__views.__alloyId71.add($.__views.pickerView);
    $.__views.provideInfoLabel = Ti.UI.createLabel({
        font: {
            fontSize: "12",
            fontFamily: "",
            fontStyle: "",
            fontWeight: ""
        },
        color: "black",
        top: "7%",
        left: "5%",
        right: "5%",
        textAlign: Titanium.UI.TEXT_ALIGNMENT_CENTER,
        text: "Please provide the following information about your photo.",
        id: "provideInfoLabel"
    });
    $.__views.pickerView.add($.__views.provideInfoLabel);
    $.__views.photoDateLabel = Ti.UI.createLabel({
        font: {
            fontSize: "12",
            fontFamily: "Montserrat-Regular",
            fontStyle: "",
            fontWeight: ""
        },
        color: "black",
        top: "30%",
        left: "5%",
        text: "Date photo was taken:",
        id: "photoDateLabel"
    });
    $.__views.pickerView.add($.__views.photoDateLabel);
    $.__views.PDhelpButton = Ti.UI.createButton({
        font: {
            fontFamily: "Entypo",
            fontSize: 30
        },
        textAlign: Titanium.UI.TEXT_ALIGNMENT_CENTER,
        color: "black",
        zIndex: 1,
        right: "6%",
        width: "6%",
        height: "7%",
        backgroundColor: "transparent",
        borderColor: "transparent",
        top: "40%",
        title: "b",
        id: "PDhelpButton"
    });
    $.__views.pickerView.add($.__views.PDhelpButton);
    helpSubmit ? $.addListener($.__views.PDhelpButton, "click", helpSubmit) : __defers["$.__views.PDhelpButton!click!helpSubmit"] = true;
    $.__views.arti = Ti.UI.createTextField({
        backgroundColor: "white",
        left: "5%",
        width: "90%",
        borderColor: "gray",
        borderRadius: "5",
        font: {
            fontFamily: "Montserrat-Regular"
        },
        color: "black",
        maxLength: "120",
        top: "38%",
        id: "arti"
    });
    $.__views.pickerView.add($.__views.arti);
    $.__views.dateAsterisk = Ti.UI.createLabel(function() {
        var o = {};
        Alloy.deepExtend(true, o, {
            font: {
                fontSize: "12",
                fontFamily: "Montserrat-Regular",
                fontStyle: "",
                fontWeight: ""
            },
            color: "red",
            textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER
        });
        Alloy.isHandheld && Alloy.deepExtend(true, o, {
            font: {
                fontSize: "20",
                fontFamily: "Montserrat-Regular",
                fontStyle: "",
                fontWeight: ""
            }
        });
        Alloy.deepExtend(true, o, {
            color: "red"
        });
        Alloy.isTablet && Alloy.deepExtend(true, o, {
            color: "red"
        });
        Alloy.deepExtend(true, o, {
            left: "46%",
            top: "28%",
            text: "*",
            id: "dateAsterisk"
        });
        return o;
    }());
    $.__views.pickerView.add($.__views.dateAsterisk);
    $.__views.TitleLabel = Ti.UI.createLabel({
        font: {
            fontSize: "12",
            fontFamily: "Montserrat-Regular",
            fontStyle: "",
            fontWeight: ""
        },
        color: "black",
        top: "54%",
        left: "5%",
        text: "Title of item:",
        id: "TitleLabel"
    });
    $.__views.pickerView.add($.__views.TitleLabel);
    $.__views.PThelpButton = Ti.UI.createButton({
        font: {
            fontFamily: "Entypo",
            fontSize: 30
        },
        textAlign: Titanium.UI.TEXT_ALIGNMENT_CENTER,
        color: "black",
        zIndex: 1,
        right: "6%",
        width: "6%",
        height: "7%",
        backgroundColor: "transparent",
        borderColor: "transparent",
        top: "62%",
        title: "b",
        id: "PThelpButton"
    });
    $.__views.pickerView.add($.__views.PThelpButton);
    helpSubmit ? $.addListener($.__views.PThelpButton, "click", helpSubmit) : __defers["$.__views.PThelpButton!click!helpSubmit"] = true;
    $.__views.TitleLabelTA = Ti.UI.createTextField({
        backgroundColor: "white",
        left: "5%",
        width: "90%",
        borderColor: "gray",
        borderRadius: "5",
        font: {
            fontFamily: "Montserrat-Regular"
        },
        color: "black",
        maxLength: "120",
        top: "60%",
        id: "TitleLabelTA"
    });
    $.__views.pickerView.add($.__views.TitleLabelTA);
    $.__views.PTasterisk = Ti.UI.createLabel(function() {
        var o = {};
        Alloy.deepExtend(true, o, {
            font: {
                fontSize: "12",
                fontFamily: "Montserrat-Regular",
                fontStyle: "",
                fontWeight: ""
            },
            color: "red",
            textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER
        });
        Alloy.isHandheld && Alloy.deepExtend(true, o, {
            font: {
                fontSize: "20",
                fontFamily: "Montserrat-Regular",
                fontStyle: "",
                fontWeight: ""
            }
        });
        Alloy.deepExtend(true, o, {
            color: "red"
        });
        Alloy.isTablet && Alloy.deepExtend(true, o, {
            color: "red"
        });
        Alloy.deepExtend(true, o, {
            top: "52%",
            left: "28.5%",
            text: "*",
            id: "PTasterisk"
        });
        return o;
    }());
    $.__views.pickerView.add($.__views.PTasterisk);
    $.__views.photoPlace = Ti.UI.createLabel({
        font: {
            fontSize: "12",
            fontFamily: "Montserrat-Regular",
            fontStyle: "",
            fontWeight: ""
        },
        color: "black",
        top: "79%",
        left: "5%",
        text: "Location photo was taken:",
        id: "photoPlace"
    });
    $.__views.pickerView.add($.__views.photoPlace);
    $.__views.PPhelpButton = Ti.UI.createButton({
        font: {
            fontFamily: "Entypo",
            fontSize: 30
        },
        textAlign: Titanium.UI.TEXT_ALIGNMENT_CENTER,
        color: "black",
        zIndex: 1,
        right: "6%",
        width: "6%",
        height: "7%",
        backgroundColor: "transparent",
        borderColor: "transparent",
        top: "87%",
        title: "b",
        id: "PPhelpButton"
    });
    $.__views.pickerView.add($.__views.PPhelpButton);
    helpSubmit ? $.addListener($.__views.PPhelpButton, "click", helpSubmit) : __defers["$.__views.PPhelpButton!click!helpSubmit"] = true;
    $.__views.photoPlaceTA = Ti.UI.createTextField({
        backgroundColor: "white",
        left: "5%",
        width: "90%",
        borderColor: "gray",
        borderRadius: "5",
        font: {
            fontFamily: "Montserrat-Regular"
        },
        color: "black",
        maxLength: "120",
        top: "85%",
        id: "photoPlaceTA"
    });
    $.__views.pickerView.add($.__views.photoPlaceTA);
    $.__views.locAsterisk = Ti.UI.createLabel(function() {
        var o = {};
        Alloy.deepExtend(true, o, {
            font: {
                fontSize: "12",
                fontFamily: "Montserrat-Regular",
                fontStyle: "",
                fontWeight: ""
            },
            color: "red",
            textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER
        });
        Alloy.isHandheld && Alloy.deepExtend(true, o, {
            font: {
                fontSize: "20",
                fontFamily: "Montserrat-Regular",
                fontStyle: "",
                fontWeight: ""
            }
        });
        Alloy.deepExtend(true, o, {
            color: "red"
        });
        Alloy.isTablet && Alloy.deepExtend(true, o, {
            color: "red"
        });
        Alloy.deepExtend(true, o, {
            left: "51.5%",
            top: "77%",
            text: "*",
            id: "locAsterisk"
        });
        return o;
    }());
    $.__views.pickerView.add($.__views.locAsterisk);
    var __alloyId73 = [];
    __alloyId73.push("Camera");
    __alloyId73.push("Photo Gallery");
    __alloyId73.push("Cancel");
    $.__views.dialog = Ti.UI.createOptionDialog({
        options: __alloyId73,
        cancel: 3,
        id: "dialog"
    });
    $.__views.photoView2 = Ti.UI.createView(function() {
        var o = {};
        Alloy.deepExtend(true, o, {
            backgroundColor: "transparent",
            height: "550dp"
        });
        Alloy.isTablet && Alloy.deepExtend(true, o, {
            backgroundColor: "transparent",
            height: "100%"
        });
        Alloy.deepExtend(true, o, {
            id: "photoView2"
        });
        return o;
    }());
    $.__views.__alloyId71.add($.__views.photoView2);
    $.__views.photoNameF = Ti.UI.createLabel({
        font: {
            fontSize: "12",
            fontFamily: "Montserrat-Regular",
            fontStyle: "",
            fontWeight: ""
        },
        color: "black",
        top: "2%",
        left: "5%",
        text: "Name of Photographer [First]:",
        id: "photoNameF"
    });
    $.__views.photoView2.add($.__views.photoNameF);
    $.__views.photoNameFTA = Ti.UI.createTextField({
        backgroundColor: "white",
        left: "5%",
        width: "90%",
        borderColor: "gray",
        borderRadius: "5",
        font: {
            fontFamily: "Montserrat-Regular"
        },
        color: "black",
        maxLength: "120",
        top: "6%",
        height: "7%",
        id: "photoNameFTA"
    });
    $.__views.photoView2.add($.__views.photoNameFTA);
    $.__views.NameAsterisk = Ti.UI.createLabel(function() {
        var o = {};
        Alloy.deepExtend(true, o, {
            font: {
                fontSize: "12",
                fontFamily: "Montserrat-Regular",
                fontStyle: "",
                fontWeight: ""
            },
            color: "red",
            textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER
        });
        Alloy.isHandheld && Alloy.deepExtend(true, o, {
            font: {
                fontSize: "20",
                fontFamily: "Montserrat-Regular",
                fontStyle: "",
                fontWeight: ""
            }
        });
        Alloy.deepExtend(true, o, {
            color: "red"
        });
        Alloy.isTablet && Alloy.deepExtend(true, o, {
            color: "red"
        });
        Alloy.deepExtend(true, o, {
            left: "57%",
            top: "1%",
            text: "*",
            id: "NameAsterisk"
        });
        return o;
    }());
    $.__views.photoView2.add($.__views.NameAsterisk);
    $.__views.photoName = Ti.UI.createLabel({
        font: {
            fontSize: "12",
            fontFamily: "Montserrat-Regular",
            fontStyle: "",
            fontWeight: ""
        },
        color: "black",
        top: "18%",
        left: "5%",
        text: "Name of Photographer [Last]:",
        id: "photoName"
    });
    $.__views.photoView2.add($.__views.photoName);
    $.__views.PNasterisk = Ti.UI.createLabel(function() {
        var o = {};
        Alloy.deepExtend(true, o, {
            font: {
                fontSize: "12",
                fontFamily: "Montserrat-Regular",
                fontStyle: "",
                fontWeight: ""
            },
            color: "red",
            textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER
        });
        Alloy.isHandheld && Alloy.deepExtend(true, o, {
            font: {
                fontSize: "20",
                fontFamily: "Montserrat-Regular",
                fontStyle: "",
                fontWeight: ""
            }
        });
        Alloy.deepExtend(true, o, {
            color: "red"
        });
        Alloy.isTablet && Alloy.deepExtend(true, o, {
            color: "red"
        });
        Alloy.deepExtend(true, o, {
            top: "17%",
            left: "57.5%",
            text: "*",
            id: "PNasterisk"
        });
        return o;
    }());
    $.__views.photoView2.add($.__views.PNasterisk);
    $.__views.photoNameTA = Ti.UI.createTextField({
        backgroundColor: "white",
        left: "5%",
        width: "90%",
        borderColor: "gray",
        borderRadius: "5",
        font: {
            fontFamily: "Montserrat-Regular"
        },
        color: "black",
        maxLength: "120",
        top: "22%",
        height: "7%",
        id: "photoNameTA"
    });
    $.__views.photoView2.add($.__views.photoNameTA);
    $.__views.photoPeopleName = Ti.UI.createLabel({
        font: {
            fontSize: "12",
            fontFamily: "Montserrat-Regular",
            fontStyle: "",
            fontWeight: ""
        },
        color: "black",
        top: "34%",
        left: "5%",
        text: "Name(s) of person/people in the photo:",
        id: "photoPeopleName"
    });
    $.__views.photoView2.add($.__views.photoPeopleName);
    $.__views.PPNhelpButton = Ti.UI.createButton({
        font: {
            fontFamily: "Entypo",
            fontSize: 30
        },
        textAlign: Titanium.UI.TEXT_ALIGNMENT_CENTER,
        color: "black",
        zIndex: 1,
        right: "6%",
        width: "6%",
        height: "7%",
        backgroundColor: "transparent",
        borderColor: "transparent",
        top: "38%",
        title: "b",
        id: "PPNhelpButton"
    });
    $.__views.photoView2.add($.__views.PPNhelpButton);
    helpSubmit ? $.addListener($.__views.PPNhelpButton, "click", helpSubmit) : __defers["$.__views.PPNhelpButton!click!helpSubmit"] = true;
    $.__views.photoPeopleNameTA = Ti.UI.createTextField({
        backgroundColor: "white",
        left: "5%",
        width: "90%",
        borderColor: "gray",
        borderRadius: "5",
        font: {
            fontFamily: "Montserrat-Regular"
        },
        color: "black",
        maxLength: "120",
        top: "38%",
        height: "7%",
        id: "photoPeopleNameTA"
    });
    $.__views.photoView2.add($.__views.photoPeopleNameTA);
    $.__views.photoEventName = Ti.UI.createLabel({
        font: {
            fontSize: "12",
            fontFamily: "Montserrat-Regular",
            fontStyle: "",
            fontWeight: ""
        },
        color: "black",
        top: "51%",
        left: "5%",
        text: "Name(s) of event taking place in photo:",
        id: "photoEventName"
    });
    $.__views.photoView2.add($.__views.photoEventName);
    $.__views.PENhelpButton = Ti.UI.createButton({
        font: {
            fontFamily: "Entypo",
            fontSize: 30
        },
        textAlign: Titanium.UI.TEXT_ALIGNMENT_CENTER,
        color: "black",
        zIndex: 1,
        right: "6%",
        width: "6%",
        height: "7%",
        backgroundColor: "transparent",
        borderColor: "transparent",
        top: "55%",
        title: "b",
        id: "PENhelpButton"
    });
    $.__views.photoView2.add($.__views.PENhelpButton);
    helpSubmit ? $.addListener($.__views.PENhelpButton, "click", helpSubmit) : __defers["$.__views.PENhelpButton!click!helpSubmit"] = true;
    $.__views.photoEventNameTA = Ti.UI.createTextField({
        backgroundColor: "white",
        left: "5%",
        width: "90%",
        borderColor: "gray",
        borderRadius: "5",
        font: {
            fontFamily: "Montserrat-Regular"
        },
        color: "black",
        maxLength: "120",
        top: "55%",
        height: "7%",
        id: "photoEventNameTA"
    });
    $.__views.photoView2.add($.__views.photoEventNameTA);
    $.__views.photoOrg = Ti.UI.createLabel({
        font: {
            fontSize: "12",
            fontFamily: "Montserrat-Regular",
            fontStyle: "",
            fontWeight: ""
        },
        color: "black",
        top: "67%",
        left: "5%",
        text: "Organizations represented in the photo:",
        id: "photoOrg"
    });
    $.__views.photoView2.add($.__views.photoOrg);
    $.__views.POhelpButton = Ti.UI.createButton({
        font: {
            fontFamily: "Entypo",
            fontSize: 30
        },
        textAlign: Titanium.UI.TEXT_ALIGNMENT_CENTER,
        color: "black",
        zIndex: 1,
        right: "6%",
        width: "6%",
        height: "7%",
        backgroundColor: "transparent",
        borderColor: "transparent",
        top: "71%",
        title: "b",
        id: "POhelpButton"
    });
    $.__views.photoView2.add($.__views.POhelpButton);
    helpSubmit ? $.addListener($.__views.POhelpButton, "click", helpSubmit) : __defers["$.__views.POhelpButton!click!helpSubmit"] = true;
    $.__views.photoOrgTA = Ti.UI.createTextField({
        backgroundColor: "white",
        left: "5%",
        width: "90%",
        borderColor: "gray",
        borderRadius: "5",
        font: {
            fontFamily: "Montserrat-Regular"
        },
        color: "black",
        maxLength: "120",
        top: "71%",
        height: "7%",
        id: "photoOrgTA"
    });
    $.__views.photoView2.add($.__views.photoOrgTA);
    $.__views.photoMake = Ti.UI.createLabel({
        font: {
            fontSize: "12",
            fontFamily: "Montserrat-Regular",
            fontStyle: "",
            fontWeight: ""
        },
        color: "black",
        top: "82%",
        left: "5%",
        text: "Make or model of camera and software used:",
        id: "photoMake"
    });
    $.__views.photoView2.add($.__views.photoMake);
    $.__views.PMhelpButton = Ti.UI.createButton({
        font: {
            fontFamily: "Entypo",
            fontSize: 30
        },
        textAlign: Titanium.UI.TEXT_ALIGNMENT_CENTER,
        color: "black",
        zIndex: 1,
        right: "6%",
        width: "6%",
        height: "7%",
        backgroundColor: "transparent",
        borderColor: "transparent",
        top: "86%",
        title: "b",
        id: "PMhelpButton"
    });
    $.__views.photoView2.add($.__views.PMhelpButton);
    helpSubmit ? $.addListener($.__views.PMhelpButton, "click", helpSubmit) : __defers["$.__views.PMhelpButton!click!helpSubmit"] = true;
    $.__views.photoMakeTA = Ti.UI.createTextField({
        backgroundColor: "white",
        left: "5%",
        width: "90%",
        borderColor: "gray",
        borderRadius: "5",
        font: {
            fontFamily: "Montserrat-Regular"
        },
        color: "black",
        maxLength: "120",
        top: "86%",
        height: "7%",
        id: "photoMakeTA"
    });
    $.__views.photoView2.add($.__views.photoMakeTA);
    $.__views.photoView3 = Ti.UI.createView(function() {
        var o = {};
        Alloy.deepExtend(true, o, {
            backgroundColor: "transparent",
            height: "350dp"
        });
        Alloy.isTablet && Alloy.deepExtend(true, o, {
            backgroundColor: "transparent",
            height: "60%"
        });
        Alloy.deepExtend(true, o, {
            id: "photoView3"
        });
        return o;
    }());
    $.__views.__alloyId71.add($.__views.photoView3);
    $.__views.photoNotes = Ti.UI.createLabel({
        font: {
            fontSize: "12",
            fontFamily: "Montserrat-Regular",
            fontStyle: "",
            fontWeight: ""
        },
        color: "black",
        top: "2%",
        left: "5%",
        text: "Additional Notes:",
        id: "photoNotes"
    });
    $.__views.photoView3.add($.__views.photoNotes);
    $.__views.PNohelpButton = Ti.UI.createButton({
        font: {
            fontFamily: "Entypo",
            fontSize: 30
        },
        textAlign: Titanium.UI.TEXT_ALIGNMENT_CENTER,
        color: "black",
        zIndex: 1,
        right: "6%",
        width: "6%",
        height: "7%",
        backgroundColor: "transparent",
        borderColor: "transparent",
        top: "11%",
        title: "b",
        id: "PNohelpButton"
    });
    $.__views.photoView3.add($.__views.PNohelpButton);
    helpSubmit ? $.addListener($.__views.PNohelpButton, "click", helpSubmit) : __defers["$.__views.PNohelpButton!click!helpSubmit"] = true;
    $.__views.photoNotesTA = Ti.UI.createTextArea({
        color: "black",
        borderColor: "gray",
        borderRadius: "5",
        left: "5%",
        width: "90%",
        height: "30%",
        backgroundColor: "white",
        font: {
            fontFamily: "Montserrat-Regular"
        },
        top: "8%",
        id: "photoNotesTA"
    });
    $.__views.photoView3.add($.__views.photoNotesTA);
    $.__views.notesAsterisk = Ti.UI.createLabel(function() {
        var o = {};
        Alloy.deepExtend(true, o, {
            font: {
                fontSize: "12",
                fontFamily: "Montserrat-Regular",
                fontStyle: "",
                fontWeight: ""
            },
            color: "red",
            textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER
        });
        Alloy.isHandheld && Alloy.deepExtend(true, o, {
            font: {
                fontSize: "20",
                fontFamily: "Montserrat-Regular",
                fontStyle: "",
                fontWeight: ""
            }
        });
        Alloy.deepExtend(true, o, {
            color: "red"
        });
        Alloy.isTablet && Alloy.deepExtend(true, o, {
            color: "red"
        });
        Alloy.deepExtend(true, o, {
            left: "36%",
            top: "1%",
            text: "*",
            id: "notesAsterisk"
        });
        return o;
    }());
    $.__views.photoView3.add($.__views.notesAsterisk);
    $.__views.imgSrc = Ti.UI.createButton({
        font: {
            fontFamily: "Montserrat-Regular"
        },
        textAlign: Titanium.UI.TEXT_ALIGNMENT_CENTER,
        color: "black",
        top: "50%",
        width: "70%",
        backgroundColor: "#f2f2f2",
        borderColor: "gray",
        borderRadius: 5,
        title: "CLICK TO ADD PHOTOGRAPH",
        id: "imgSrc"
    });
    $.__views.photoView3.add($.__views.imgSrc);
    showOptions ? $.addListener($.__views.imgSrc, "click", showOptions) : __defers["$.__views.imgSrc!click!showOptions"] = true;
    $.__views.next = Ti.UI.createButton({
        font: {
            fontFamily: "Montserrat-Regular"
        },
        textAlign: Titanium.UI.TEXT_ALIGNMENT_CENTER,
        color: "black",
        top: "65%",
        width: "40%",
        backgroundColor: "#f2f2f2",
        borderColor: "gray",
        borderRadius: 5,
        title: "Next",
        id: "next"
    });
    $.__views.photoView3.add($.__views.next);
    submit ? $.addListener($.__views.next, "click", submit) : __defers["$.__views.next!click!submit"] = true;
    exports.destroy = function() {};
    _.extend($, $.__views);
    arguments[0] || {};
    require("ti.imagefactory");
    Alloy.Globals.DigitalForm = $.photoWin;
    var userImage;
    var digitalPhotoMimeType;
    Ti.Platform.displayCaps.platformWidth;
    Ti.Platform.displayCaps.platformHeight;
    $.QL.image = "/images/QL300.png";
    $.qp.image = "/images/QM_FINAL_outlines.png";
    Ti.UI.createNotification({
        message: "Please Stand By",
        duration: Ti.UI.NOTIFICATION_DURATION_LONG
    });
    var cameraPermission = "android.permission.CAMERA";
    var storagePermission = "android.permission.READ_EXTERNAL_STORAGE";
    var hasCameraPermission = Ti.Android.hasPermission(cameraPermission);
    var hasStoragePermission = Ti.Android.hasPermission(storagePermission);
    var permissionsToRequest = [];
    hasCameraPermission || permissionsToRequest.push(cameraPermission);
    hasStoragePermission || permissionsToRequest.push(storagePermission);
    permissionsToRequest.length > 0 && Ti.Android.requestPermissions(permissionsToRequest, function(e) {
        e.success ? Ti.API.info("SUCCESS") : Ti.API.info("ERROR: " + e.error);
    });
    var data = require("data");
    __defers["$.__views.back!click!backButton"] && $.addListener($.__views.back, "click", backButton);
    __defers["$.__views.PDhelpButton!click!helpSubmit"] && $.addListener($.__views.PDhelpButton, "click", helpSubmit);
    __defers["$.__views.PThelpButton!click!helpSubmit"] && $.addListener($.__views.PThelpButton, "click", helpSubmit);
    __defers["$.__views.PPhelpButton!click!helpSubmit"] && $.addListener($.__views.PPhelpButton, "click", helpSubmit);
    __defers["$.__views.PPNhelpButton!click!helpSubmit"] && $.addListener($.__views.PPNhelpButton, "click", helpSubmit);
    __defers["$.__views.PENhelpButton!click!helpSubmit"] && $.addListener($.__views.PENhelpButton, "click", helpSubmit);
    __defers["$.__views.POhelpButton!click!helpSubmit"] && $.addListener($.__views.POhelpButton, "click", helpSubmit);
    __defers["$.__views.PMhelpButton!click!helpSubmit"] && $.addListener($.__views.PMhelpButton, "click", helpSubmit);
    __defers["$.__views.PNohelpButton!click!helpSubmit"] && $.addListener($.__views.PNohelpButton, "click", helpSubmit);
    __defers["$.__views.imgSrc!click!showOptions"] && $.addListener($.__views.imgSrc, "click", showOptions);
    __defers["$.__views.next!click!submit"] && $.addListener($.__views.next, "click", submit);
    _.extend($, exports);
}

var Alloy = require("/alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;