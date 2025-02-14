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
        var scanOptionDialog = Ti.UI.createOptionDialog(opts);
        scanOptionDialog.show();
        scanOptionDialog.addEventListener("click", function(event) {
            switch (event.index) {
              case 0:
                Titanium.Media.openPhotoGallery({
                    success: function(event) {
                        var imageCorrection = Alloy.Globals.rotateAndResize(event.media, event.media.width, 100);
                        imageCorrection && Ti.API.info("Corrected Blob Issue: " + imageCorrection.read() + " " + imageCorrection.read().mimeType);
                        var imageBlob = imageCorrection.read();
                        if (event.mediaType == Ti.Media.MEDIA_TYPE_PHOTO) {
                            console.log("This is in digital photoform, success photogallery");
                            Ti.API.debug("Our type was: " + event.media.mimeType);
                            Ti.API.debug("Our api name was: " + event.media.apiName);
                            scannedItem = null;
                            try {
                                scannedItem = imageBlob;
                                var isEncoded = Alloy.Globals.base64Check(scannedItem);
                                Ti.API.info("Is this properly setup?" + isEncoded);
                                scannedItemMimeType = scannedItem.mimeType;
                                $.scanSrc.setTitle("Change Image");
                                alert("File added. Load times vary based on connection speed.");
                            } catch (e) {
                                Ti.UI.createNotification({
                                    message: "Invalid selection. Please try a different photo.",
                                    duration: Ti.UI.NOTIFICATION_DURATION_SHORT
                                }).show();
                            }
                        } else alert("got the wrong type back =" + event.mediaType);
                    },
                    cancel: function() {
                        Ti.UI.createNotification({
                            message: "Abort adding in scanned item.",
                            duration: Ti.UI.NOTIFICATION_DURATION_SHORT
                        }).show();
                    },
                    error: function(error) {
                        var a = Titanium.UI.createAlertDialog({
                            title: "Photo"
                        });
                        error.code == Titanium.Media.NO_CAMERA ? a.setMessage("Please run this test on device") : a.setMessage("Unexpected error: " + error.code);
                        a.show();
                    },
                    saveToPhotoGallery: false
                });
                break;

              default:
                Ti.UI.createNotification({
                    message: "Abort adding in scanned item.",
                    duration: Ti.UI.NOTIFICATION_DURATION_SHORT
                }).show();
            }
        });
        scanOptionDialog = null;
        Ti.API.debug("image scannedItemMimeType: " + scannedItemMimeType);
    }
    function submit(e) {
        if ("" === $.arti.value || "" === $.artifactText.value || "" === $.photoNF.value || "" === $.photoN.value || "" === $.photoLocationTA.value || "" === $.TitleLabelTA.value || "" === $.photoNo.value) alert("You must fill out all the required fields to submit!"); else if (scannedItem) {
            var fullName;
            var Name = $.photoN.value.split(" ");
            if (" " != Name[0] || " " != Name[1] || " " != Name[2]) var fullName = $.photoN.value.split(" "); else fullName = $.photoN.value;
            var fileExt = scannedItem.file.name;
            fileExt = "." + fileExt.substr(fileExt.lastIndexOf(".") + 1);
            Ti.API.info("File Extension " + fileExt);
            var currentData = {
                photoDate: $.arti.value,
                userPhoto: scannedItem,
                resourceType: "Scanned Material",
                submitType: "Upload Image",
                photoStepNumber: 3,
                photoFirstName: $.photoNF.value,
                photoLastName: $.photoN.value,
                photoLanguage: "EN",
                photoRights: "I have the permission of the rights owner to make this resource available through this repository.",
                photoEventName: $.photoEN.value,
                photoMemberType: "No Membership",
                photoPeopleNames: $.photoPN.value,
                photoOrg: $.photoO.value,
                photoModel: $.photoM.value,
                photoNotes: $.photoNo.value,
                artifactType: $.artifactText.value,
                photoTitle: $.TitleLabelTA.value,
                mimeType: scannedItemMimeType,
                photoLocation: $.photoLocationTA.value,
                photoMeasurements: $.photoMeasurementsTA.value,
                fileExtension: fileExt
            };
            data.setData(currentData);
            var args = {
                customDate: $.arti.value,
                customImage: currentData["userPhoto"],
                customImageSize: scannedItem.size || "nil",
                photoFullName: fullName,
                thisTitle: $.Title.text,
                photoDate: $.arti.value,
                photoTitle: $.TitleLabelTA.value,
                photoFirstName: $.photoNF.value,
                photoLastName: $.photoN.value,
                photoEventName: $.photoEN.value,
                photoPeopleNames: $.photoPN.value,
                photoOrg: $.photoO.value,
                photoModel: $.photoM.value,
                photoNotes: $.photoNo.value,
                artifactType: $.artifactText.value,
                photoLocation: $.photoLocationTA.value,
                photoMeasurements: $.photoMeasurementsTA.value,
                photoNotes: $.photoNo.value
            };
            submissionPageController = Alloy.createController("submissionPage", args).getView();
            submissionPageController.open();
        } else alert("You need to select an item to submit!");
    }
    function showArtifact() {
        $.artifactText.blur();
        $.artifactText.editable = false;
        var scanArtifactDialog = Ti.UI.createOptionDialog(artifacts);
        scanArtifactDialog.show();
        scanArtifactDialog.addEventListener("click", function(event) {
            console.log("User selected artifact: " + JSON.stringify(event.source.selectedIndex));
            var artiToast = Ti.UI.createNotification({
                message: "Please write down your own artifact type in the textfield.",
                duration: Ti.UI.NOTIFICATION_DURATION_SHORT
            });
            if (13 == event.source.selectedIndex) Ti.UI.createNotification({
                message: "You canceled selecting an artifact type.",
                duration: Ti.UI.NOTIFICATION_DURATION_SHORT
            }).show(); else if (12 == event.source.selectedIndex) {
                scanArtifactDialog.hide();
                $.artifactText.setValue("");
                artiToast.show();
                $.artifactText.value = " ";
                $.artifactText.editable = true;
                $.artifactText.focus();
            } else {
                $.artifactText.setValue(event.source.options[event.source.selectedIndex]);
                $.artifactText.blur();
                console.log("ArtifactType: " + $.artifactText.value);
            }
            artiToast = null;
        });
    }
    function backButton(e) {
        $.scanWin.close();
    }
    function helpSubmit(e) {
        var args = {
            thisTitle: $.Title.text,
            thisDate: $.photoDate.text,
            thisItem: $.TitleLabel.text,
            thisFirstName: $.photoNameF.text,
            thisName: $.photoName.text,
            thisPerson: $.photoPeopleName.text,
            thisEvent: $.photoEventName.text,
            thisOrg: $.photoOrg.text,
            thisMake: $.photoMake.text,
            thisDepict: $.photoLocation.text,
            thisMeasure: $.photoMeasurements.text,
            thisNote: $.photoNotes.text,
            thisButtonID: e.source.id
        };
        alertController = Alloy.createController("helpNote", args).getView();
        alertController.open();
    }
    function hideSoftKeyboard(e) {
        Ti.UI.Android.hideSoftKeyboard();
    }
    require("/alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "scanItemForm";
    this.args = arguments[0] || {};
    if (arguments[0]) {
        __processArg(arguments[0], "__parentSymbol");
        __processArg(arguments[0], "$model");
        __processArg(arguments[0], "__itemTemplate");
    }
    var $ = this;
    var exports = {};
    var __defers = {};
    $.__views.scanWin = Ti.UI.createWindow({
        orientationModes: [ Ti.UI.PORTRAIT ],
        height: Titanium.UI.FILL,
        width: Titanium.UI.FILL,
        windowSoftInputMode: Titanium.UI.Android.SOFT_INPUT_STATE_HIDDEN,
        id: "scanWin",
        theme: "mytheme"
    });
    $.__views.scanWin && $.addTopLevelView($.__views.scanWin);
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
    $.__views.scanWin.add($.__views.navBar);
    $.__views.back = Ti.UI.createButton({
        font: {
            fontFamily: "queensfoundationfont",
            fontSize: 35
        },
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
        image: "/images/QL300.png"
    });
    $.__views.navBar.add($.__views.QL);
    $.__views.titleBan = Ti.UI.createView({
        backgroundColor: "white",
        top: "7%",
        height: "20%",
        font: {
            fontSize: 12
        },
        id: "titleBan"
    });
    $.__views.scanWin.add($.__views.titleBan);
    $.__views.qp = Ti.UI.createImageView({
        top: "8%",
        width: "30%",
        left: "7%",
        id: "qp",
        image: "/images/QM_FINAL_outlines.png"
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
        top: "15%",
        right: "5%",
        text: "Scanned Item",
        id: "Title"
    });
    $.__views.titleBan.add($.__views.Title);
    var __alloyId104 = [];
    __alloyId104.push("Camera");
    __alloyId104.push("Photo Gallery");
    __alloyId104.push("Help");
    __alloyId104.push("Cancel");
    var __alloyId110 = [];
    __alloyId110.push("Help");
    $.__views.dialog = Ti.UI.createOptionDialog({
        options: __alloyId104,
        buttonNames: __alloyId110,
        cancel: 3,
        id: "dialog"
    });
    $.__views.__alloyId112 = Ti.UI.createScrollView({
        top: "18%",
        backgroundColor: "#e6e6e6",
        showHorizontalScrollIndicator: "false",
        showVerticalScrollIndicator: "true",
        width: Titanium.UI.FILL,
        bottom: "0%",
        contentHeight: Titanium.UI.SIZE,
        contentWidth: Titanium.UI.FILL,
        layout: "vertical",
        id: "__alloyId112"
    });
    $.__views.scanWin.add($.__views.__alloyId112);
    $.__views.pickerView = Ti.UI.createView({
        top: "0%",
        left: "0%",
        backgroundColor: "transparent",
        height: "300dp",
        width: "100%",
        id: "pickerView"
    });
    $.__views.__alloyId112.add($.__views.pickerView);
    $.__views.provideInfo = Ti.UI.createLabel({
        font: {
            fontSize: "12",
            fontFamily: "",
            fontStyle: "",
            fontWeight: ""
        },
        color: "black",
        left: "5%",
        right: "5%",
        textAlign: Titanium.UI.TEXT_ALIGNMENT_CENTER,
        top: "10%",
        text: "Please provide the following information about your scanned artifact.",
        id: "provideInfo"
    });
    $.__views.pickerView.add($.__views.provideInfo);
    $.__views.photoDate = Ti.UI.createLabel({
        font: {
            fontSize: "12",
            fontFamily: "Montserrat-Regular",
            fontStyle: "",
            fontWeight: ""
        },
        color: "black",
        top: "30%",
        left: "5%",
        text: "Date physical object was created:",
        id: "photoDate"
    });
    $.__views.pickerView.add($.__views.photoDate);
    $.__views.dateAsterisk = Ti.UI.createLabel(function() {
        var o = {};
        Alloy.deepExtend(true, o, {
            font: {
                fontSize: "12",
                fontFamily: "Montserrat-Regular",
                fontStyle: "",
                fontWeight: ""
            },
            color: "black"
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
            left: "63%",
            top: "28%",
            text: "*",
            id: "dateAsterisk"
        });
        return o;
    }());
    $.__views.pickerView.add($.__views.dateAsterisk);
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
    $.__views.PDhelpButton = Ti.UI.createButton({
        font: {
            fontFamily: "Entypo",
            fontSize: 30
        },
        color: "black",
        zIndex: 1,
        right: "5%",
        width: "7%",
        height: "6%",
        backgroundColor: "transparent",
        borderColor: "transparent",
        top: "40%",
        title: "b",
        id: "PDhelpButton"
    });
    $.__views.pickerView.add($.__views.PDhelpButton);
    helpSubmit ? $.addListener($.__views.PDhelpButton, "click", helpSubmit) : __defers["$.__views.PDhelpButton!click!helpSubmit"] = true;
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
        color: "black",
        zIndex: 1,
        right: "5%",
        width: "7%",
        height: "6%",
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
            color: "black"
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
            left: "28%",
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
        text: "Type of artifact you scanned:",
        id: "photoPlace"
    });
    $.__views.pickerView.add($.__views.photoPlace);
    $.__views.locAsterisk = Ti.UI.createLabel(function() {
        var o = {};
        Alloy.deepExtend(true, o, {
            font: {
                fontSize: "12",
                fontFamily: "Montserrat-Regular",
                fontStyle: "",
                fontWeight: ""
            },
            color: "black"
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
            left: "55.5%",
            top: "77%",
            text: "*",
            id: "locAsterisk"
        });
        return o;
    }());
    $.__views.pickerView.add($.__views.locAsterisk);
    $.__views.dropDownButton = Ti.UI.createButton({
        font: {
            fontFamily: "queensfoundationfont",
            fontSize: 35
        },
        color: "black",
        zIndex: 1,
        top: "83%",
        left: "80%",
        backgroundColor: "transparent",
        borderColor: "transparent",
        title: "U",
        id: "dropDownButton"
    });
    $.__views.pickerView.add($.__views.dropDownButton);
    showArtifact ? $.addListener($.__views.dropDownButton, "singletap", showArtifact) : __defers["$.__views.dropDownButton!singletap!showArtifact"] = true;
    $.__views.artifactText = Ti.UI.createTextField({
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
        hintText: "Press DropDown button to set type",
        hintTextColor: "gray",
        enabled: false,
        id: "artifactText"
    });
    $.__views.pickerView.add($.__views.artifactText);
    hideSoftKeyboard ? $.addListener($.__views.artifactText, "focus", hideSoftKeyboard) : __defers["$.__views.artifactText!focus!hideSoftKeyboard"] = true;
    $.__views.photoView2 = Ti.UI.createView({
        backgroundColor: "transparent",
        height: "550dp",
        id: "photoView2"
    });
    $.__views.__alloyId112.add($.__views.photoView2);
    $.__views.photoNameF = Ti.UI.createLabel({
        font: {
            fontSize: "12",
            fontFamily: "Montserrat-Regular",
            fontStyle: "",
            fontWeight: ""
        },
        color: "black",
        top: "3%",
        left: "5%",
        text: "Name of artifact's creator [First]:",
        id: "photoNameF"
    });
    $.__views.photoView2.add($.__views.photoNameF);
    $.__views.NameAsterisk = Ti.UI.createLabel(function() {
        var o = {};
        Alloy.deepExtend(true, o, {
            font: {
                fontSize: "12",
                fontFamily: "Montserrat-Regular",
                fontStyle: "",
                fontWeight: ""
            },
            color: "black"
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
            left: "62%",
            top: "2%",
            text: "*",
            id: "NameAsterisk"
        });
        return o;
    }());
    $.__views.photoView2.add($.__views.NameAsterisk);
    $.__views.photoNF = Ti.UI.createTextField({
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
        id: "photoNF"
    });
    $.__views.photoView2.add($.__views.photoNF);
    $.__views.photoName = Ti.UI.createLabel({
        font: {
            fontSize: "12",
            fontFamily: "Montserrat-Regular",
            fontStyle: "",
            fontWeight: ""
        },
        color: "black",
        top: "15%",
        left: "5%",
        text: "Name of artifact's creator [Last]:",
        id: "photoName"
    });
    $.__views.photoView2.add($.__views.photoName);
    $.__views.NameLAsterisk = Ti.UI.createLabel(function() {
        var o = {};
        Alloy.deepExtend(true, o, {
            font: {
                fontSize: "12",
                fontFamily: "Montserrat-Regular",
                fontStyle: "",
                fontWeight: ""
            },
            color: "black"
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
            left: "61%",
            top: "13.5%",
            text: "*",
            id: "NameLAsterisk"
        });
        return o;
    }());
    $.__views.photoView2.add($.__views.NameLAsterisk);
    $.__views.photoN = Ti.UI.createTextField({
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
        top: "18%",
        id: "photoN"
    });
    $.__views.photoView2.add($.__views.photoN);
    $.__views.photoPeopleName = Ti.UI.createLabel({
        font: {
            fontSize: "12",
            fontFamily: "Montserrat-Regular",
            fontStyle: "",
            fontWeight: ""
        },
        color: "black",
        top: "27%",
        left: "5%",
        text: "Name(s) of person/people represented in the artifact:",
        id: "photoPeopleName"
    });
    $.__views.photoView2.add($.__views.photoPeopleName);
    $.__views.PPNhelpButton = Ti.UI.createButton({
        font: {
            fontFamily: "Entypo",
            fontSize: 30
        },
        color: "black",
        zIndex: 1,
        right: "5%",
        width: "7%",
        height: "6%",
        backgroundColor: "transparent",
        borderColor: "transparent",
        top: "31%",
        title: "b",
        id: "PPNhelpButton"
    });
    $.__views.photoView2.add($.__views.PPNhelpButton);
    helpSubmit ? $.addListener($.__views.PPNhelpButton, "click", helpSubmit) : __defers["$.__views.PPNhelpButton!click!helpSubmit"] = true;
    $.__views.photoPN = Ti.UI.createTextField({
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
        top: "31%",
        id: "photoPN"
    });
    $.__views.photoView2.add($.__views.photoPN);
    $.__views.photoEventName = Ti.UI.createLabel({
        font: {
            fontSize: "12",
            fontFamily: "Montserrat-Regular",
            fontStyle: "",
            fontWeight: ""
        },
        color: "black",
        top: "40%",
        left: "5%",
        text: "Name(s) of event represented in the artifact:",
        id: "photoEventName"
    });
    $.__views.photoView2.add($.__views.photoEventName);
    $.__views.PENhelpButton = Ti.UI.createButton({
        font: {
            fontFamily: "Entypo",
            fontSize: 30
        },
        color: "black",
        zIndex: 1,
        right: "5%",
        width: "7%",
        height: "6%",
        backgroundColor: "transparent",
        borderColor: "transparent",
        top: "43%",
        title: "b",
        id: "PENhelpButton"
    });
    $.__views.photoView2.add($.__views.PENhelpButton);
    helpSubmit ? $.addListener($.__views.PENhelpButton, "click", helpSubmit) : __defers["$.__views.PENhelpButton!click!helpSubmit"] = true;
    $.__views.photoEN = Ti.UI.createTextField({
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
        top: "43%",
        id: "photoEN"
    });
    $.__views.photoView2.add($.__views.photoEN);
    $.__views.photoOrg = Ti.UI.createLabel({
        font: {
            fontSize: "12",
            fontFamily: "Montserrat-Regular",
            fontStyle: "",
            fontWeight: ""
        },
        color: "black",
        top: "52%",
        left: "5%",
        text: "Organizations represented by the artifact:",
        id: "photoOrg"
    });
    $.__views.photoView2.add($.__views.photoOrg);
    $.__views.POhelpButton = Ti.UI.createButton({
        font: {
            fontFamily: "Entypo",
            fontSize: 30
        },
        color: "black",
        zIndex: 1,
        right: "5%",
        width: "7%",
        height: "6%",
        backgroundColor: "transparent",
        borderColor: "transparent",
        top: "55%",
        title: "b",
        id: "POhelpButton"
    });
    $.__views.photoView2.add($.__views.POhelpButton);
    helpSubmit ? $.addListener($.__views.POhelpButton, "click", helpSubmit) : __defers["$.__views.POhelpButton!click!helpSubmit"] = true;
    $.__views.photoO = Ti.UI.createTextField({
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
        id: "photoO"
    });
    $.__views.photoView2.add($.__views.photoO);
    $.__views.photoMake = Ti.UI.createLabel({
        font: {
            fontSize: "12",
            fontFamily: "Montserrat-Regular",
            fontStyle: "",
            fontWeight: ""
        },
        color: "black",
        top: "64%",
        left: "5%",
        text: "Make or model of scanner and software used:",
        id: "photoMake"
    });
    $.__views.photoView2.add($.__views.photoMake);
    $.__views.PMhelpButton = Ti.UI.createButton({
        font: {
            fontFamily: "Entypo",
            fontSize: 30
        },
        color: "black",
        zIndex: 1,
        right: "5%",
        width: "7%",
        height: "6%",
        backgroundColor: "transparent",
        borderColor: "transparent",
        top: "67%",
        title: "b",
        id: "PMhelpButton"
    });
    $.__views.photoView2.add($.__views.PMhelpButton);
    helpSubmit ? $.addListener($.__views.PMhelpButton, "click", helpSubmit) : __defers["$.__views.PMhelpButton!click!helpSubmit"] = true;
    $.__views.photoM = Ti.UI.createTextField({
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
        top: "67%",
        id: "photoM"
    });
    $.__views.photoView2.add($.__views.photoM);
    $.__views.photoLocation = Ti.UI.createLabel({
        font: {
            fontSize: "12",
            fontFamily: "Montserrat-Regular",
            fontStyle: "",
            fontWeight: ""
        },
        color: "black",
        top: "76%",
        left: "5%",
        text: "Places depicted in scanned artifact:",
        id: "photoLocation"
    });
    $.__views.photoView2.add($.__views.photoLocation);
    $.__views.PLochelpButton = Ti.UI.createButton({
        font: {
            fontFamily: "Entypo",
            fontSize: 30
        },
        color: "black",
        zIndex: 1,
        right: "5%",
        width: "7%",
        height: "6%",
        backgroundColor: "transparent",
        borderColor: "transparent",
        top: "79%",
        title: "b",
        id: "PLochelpButton"
    });
    $.__views.photoView2.add($.__views.PLochelpButton);
    helpSubmit ? $.addListener($.__views.PLochelpButton, "click", helpSubmit) : __defers["$.__views.PLochelpButton!click!helpSubmit"] = true;
    $.__views.photoLocationTA = Ti.UI.createTextField({
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
        top: "79%",
        id: "photoLocationTA"
    });
    $.__views.photoView2.add($.__views.photoLocationTA);
    $.__views.placesAsterisk = Ti.UI.createLabel(function() {
        var o = {};
        Alloy.deepExtend(true, o, {
            font: {
                fontSize: "12",
                fontFamily: "Montserrat-Regular",
                fontStyle: "",
                fontWeight: ""
            },
            color: "black"
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
            left: "66%",
            top: "75%",
            text: "*",
            id: "placesAsterisk"
        });
        return o;
    }());
    $.__views.photoView2.add($.__views.placesAsterisk);
    $.__views.photoMeasurements = Ti.UI.createLabel({
        font: {
            fontSize: "12",
            fontFamily: "Montserrat-Regular",
            fontStyle: "",
            fontWeight: ""
        },
        color: "black",
        top: "88%",
        left: "5%",
        text: "Measurements of scanned artifact:",
        id: "photoMeasurements"
    });
    $.__views.photoView2.add($.__views.photoMeasurements);
    $.__views.PMehelpButton = Ti.UI.createButton({
        font: {
            fontFamily: "Entypo",
            fontSize: 30
        },
        color: "black",
        zIndex: 1,
        right: "5%",
        width: "7%",
        height: "6%",
        backgroundColor: "transparent",
        borderColor: "transparent",
        top: "91%",
        title: "b",
        id: "PMehelpButton"
    });
    $.__views.photoView2.add($.__views.PMehelpButton);
    helpSubmit ? $.addListener($.__views.PMehelpButton, "click", helpSubmit) : __defers["$.__views.PMehelpButton!click!helpSubmit"] = true;
    $.__views.photoMeasurementsTA = Ti.UI.createTextField({
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
        top: "91%",
        id: "photoMeasurementsTA"
    });
    $.__views.photoView2.add($.__views.photoMeasurementsTA);
    $.__views.photoView3 = Ti.UI.createView(function() {
        var o = {};
        Alloy.deepExtend(true, o, {
            backgroundColor: "transparent",
            height: "270dp"
        });
        Alloy.isTablet && Alloy.deepExtend(true, o, {
            backgroundColor: "transparent",
            height: "130dp"
        });
        Alloy.deepExtend(true, o, {
            id: "photoView3"
        });
        return o;
    }());
    $.__views.__alloyId112.add($.__views.photoView3);
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
        text: "Additional notes:",
        id: "photoNotes"
    });
    $.__views.photoView3.add($.__views.photoNotes);
    $.__views.notesAsterisk = Ti.UI.createLabel(function() {
        var o = {};
        Alloy.deepExtend(true, o, {
            font: {
                fontSize: "12",
                fontFamily: "Montserrat-Regular",
                fontStyle: "",
                fontWeight: ""
            },
            color: "black"
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
            top: "0%",
            text: "*",
            id: "notesAsterisk"
        });
        return o;
    }());
    $.__views.photoView3.add($.__views.notesAsterisk);
    $.__views.PNohelpButton = Ti.UI.createButton({
        font: {
            fontFamily: "Entypo",
            fontSize: 30
        },
        color: "black",
        zIndex: 1,
        right: "5%",
        width: "8%",
        height: "7%",
        backgroundColor: "transparent",
        borderColor: "transparent",
        top: "10%",
        title: "b",
        id: "PNohelpButton"
    });
    $.__views.photoView3.add($.__views.PNohelpButton);
    helpSubmit ? $.addListener($.__views.PNohelpButton, "click", helpSubmit) : __defers["$.__views.PNohelpButton!click!helpSubmit"] = true;
    $.__views.photoNo = Ti.UI.createTextArea({
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
        top: "7.5%",
        id: "photoNo"
    });
    $.__views.photoView3.add($.__views.photoNo);
    $.__views.scanSrc = Ti.UI.createButton({
        font: {
            fontFamily: "Montserrat-Regular"
        },
        color: "black",
        top: "50%",
        width: "70%",
        backgroundColor: "#f2f2f2",
        borderColor: "gray",
        borderRadius: 5,
        title: "CLICK TO ADD SCANNED ITEM",
        id: "scanSrc"
    });
    $.__views.photoView3.add($.__views.scanSrc);
    showOptions ? $.addListener($.__views.scanSrc, "click", showOptions) : __defers["$.__views.scanSrc!click!showOptions"] = true;
    $.__views.next = Ti.UI.createButton({
        font: {
            fontFamily: "Montserrat-Regular"
        },
        color: "black",
        width: "40%",
        backgroundColor: "#f2f2f2",
        borderColor: "gray",
        borderRadius: "5",
        top: "69%",
        title: "Next",
        id: "next"
    });
    $.__views.photoView3.add($.__views.next);
    submit ? $.addListener($.__views.next, "click", submit) : __defers["$.__views.next!click!submit"] = true;
    exports.destroy = function() {};
    _.extend($, $.__views);
    Alloy.Globals.ScanForm = $.scanWin;
    $.Title.text;
    require("ti.imagefactory");
    var scannedItem;
    var scannedItemMimeType;
    Ti.Platform.displayCaps.platformWidth;
    Ti.Platform.displayCaps.platformHeight;
    $.artifactText.editable = false;
    $.QL.image = "/images/QL300.png";
    $.qp.image = "/images/QM_FINAL_outlines.png";
    Ti.UI.createNotification({
        message: "Please Stand By",
        duration: Ti.UI.NOTIFICATION_DURATION_LONG
    });
    var opts = {
        title: "Select File Type"
    };
    opts.options = [ "Photo", "Cancel" ];
    opts.buttonNames = [ "Help" ];
    opts.cancel = 1;
    var artifacts = {
        title: "Select Artifact Type"
    };
    artifacts.options = [ "Photo Print", "Photo negative", "Photo positive", "Ephemera", "Leaflet", "Manuscript", "Diary", "Clipping", "Advertisement", "Album", "Broadside", "Cartoon", "Other", "Cancel" ];
    artifacts.cancel = 13;
    var data = require("data");
    __defers["$.__views.back!click!backButton"] && $.addListener($.__views.back, "click", backButton);
    __defers["$.__views.PDhelpButton!click!helpSubmit"] && $.addListener($.__views.PDhelpButton, "click", helpSubmit);
    __defers["$.__views.PThelpButton!click!helpSubmit"] && $.addListener($.__views.PThelpButton, "click", helpSubmit);
    __defers["$.__views.dropDownButton!singletap!showArtifact"] && $.addListener($.__views.dropDownButton, "singletap", showArtifact);
    __defers["$.__views.artifactText!focus!hideSoftKeyboard"] && $.addListener($.__views.artifactText, "focus", hideSoftKeyboard);
    __defers["$.__views.PPNhelpButton!click!helpSubmit"] && $.addListener($.__views.PPNhelpButton, "click", helpSubmit);
    __defers["$.__views.PENhelpButton!click!helpSubmit"] && $.addListener($.__views.PENhelpButton, "click", helpSubmit);
    __defers["$.__views.POhelpButton!click!helpSubmit"] && $.addListener($.__views.POhelpButton, "click", helpSubmit);
    __defers["$.__views.PMhelpButton!click!helpSubmit"] && $.addListener($.__views.PMhelpButton, "click", helpSubmit);
    __defers["$.__views.PLochelpButton!click!helpSubmit"] && $.addListener($.__views.PLochelpButton, "click", helpSubmit);
    __defers["$.__views.PMehelpButton!click!helpSubmit"] && $.addListener($.__views.PMehelpButton, "click", helpSubmit);
    __defers["$.__views.PNohelpButton!click!helpSubmit"] && $.addListener($.__views.PNohelpButton, "click", helpSubmit);
    __defers["$.__views.scanSrc!click!showOptions"] && $.addListener($.__views.scanSrc, "click", showOptions);
    __defers["$.__views.next!click!submit"] && $.addListener($.__views.next, "click", submit);
    _.extend($, exports);
}

var Alloy = require("/alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;