sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment"
], (Controller, MessageToast, MessageBox, JSONModel, Filter, FilterOperator, Fragment) => {
    "use strict";

    return Controller.extend("pluspe.pagodetracsunat.controller.View", {
        onInit: function () { },

        // Función para los checkboxes del primer grupo
        onCheckSelect: function (oEvent) {
            var oSelectedCheckBox = oEvent.getSource();
            var aGroupCheckBoxes = ["ListaDetracPorPagar", "VisualizarLoteDetrac", "AsignarConstDeposito", "ListaPagosDetraccion"];

            this._handleCheckBoxGroup(oSelectedCheckBox, aGroupCheckBoxes);

            // Obtener el ID completo del checkbox y luego tomar la última parte
            var sCheckBoxId = oSelectedCheckBox.getId();
            var aIdParts = sCheckBoxId.split("-");
            var sLastPart = aIdParts[aIdParts.length - 1];
            // Según el checkbox seleccionado, mostrar u ocultar los HBox
            if (oSelectedCheckBox.getSelected()) {
                // Mostrar el HBox correspondiente al checkbox seleccionado
                switch (sLastPart) {
                    case "ListaDetracPorPagar":
                        this.getView().byId("Panel1").setVisible(true);
                        this.getView().byId("Panel2").setVisible(false);
                        this.getView().byId("Panel3").setVisible(false)
                        this.getView().byId("Panel4").setVisible(false);
                        this.getView().byId("cuentaP").setVisible(true);
                        break;

                    case "VisualizarLoteDetrac":
                        this.getView().byId("Panel1").setVisible(false);
                        this.getView().byId("Panel2").setVisible(true);
                        this.getView().byId("Panel3").setVisible(false)
                        this.getView().byId("Panel4").setVisible(false);
                        this.getView().byId("cuentaP").setVisible(false);
                        break;
                    case "AsignarConstDeposito":
                        this.getView().byId("Panel1").setVisible(false);
                        this.getView().byId("Panel2").setVisible(false);
                        this.getView().byId("Panel4").setVisible(false);
                        this.getView().byId("Panel3").setVisible(true);
                        this.getView().byId("cuentaP").setVisible(false);
                        break;
                    case "ListaPagosDetraccion":
                        this.getView().byId("Panel1").setVisible(false);
                        this.getView().byId("Panel2").setVisible(false);
                        this.getView().byId("Panel3").setVisible(false);
                        this.getView().byId("cuentaP").setVisible(false);
                        this.getView().byId("Panel4").setVisible(true);
                        break;
                    default:
                        break;
                }
            } else {
                // Si el checkbox se deseleccionó, ocultar todos los HBox
                this.getView().byId("hboxlote").setVisible(false); // Mostrar HBox2
                this.getView().byId("hboxfile").setVisible(false); // Mostrar HBox2
                this.getView().byId("hboxButton").setVisible(false);
            }
        },

        handleUploadPress: function (oEvent) {
            var oFileUploader = this.getView().byId("fileUploader"); // Obtener el FileUploader
            var oFile = oFileUploader.oFileUpload.files[0]; // Obtener el archivo seleccionado
            
            if (!oFile) {
                console.error("No se seleccionó ningún archivo.");
                sap.m.MessageToast.show("Por favor, selecciona un archivo.");
                return;
            }
        
            console.log("Archivo seleccionado:", oFile);
        
            var reader = new FileReader();
            var that = this; // Guardar contexto
        
            reader.onload = function (e) {
                if (!e.target.result) {
                    console.error("El archivo no tiene contenido.");
                    return;
                }
        
                console.log("Archivo leído correctamente.");
                
                var sFileContent = e.target.result.trim(); // Contenido del archivo en string
                console.log("Contenido del archivo:", sFileContent);
                
                var oModel = that.getView().getModel();
                var sPath = "/gettxtSet"; // Ruta de la entidad OData
        
                var oPayload = {                   
                    InTxt: sFileContent
                };
        
                oModel.create(sPath, oPayload, {
                    success: function () {
                        sap.m.MessageToast.show("Archivo enviado correctamente.");
                    },
                    error: function () {
                        sap.m.MessageToast.show("Error al enviar el archivo.");
                    }
                });
            };
        
            reader.onerror = function (error) {
                console.error("Error al leer el archivo:", error);
            };
        
            reader.readAsText(oFile); // Leer archivo como texto
        },
        

        // Función para los checkboxes del segundo grupo
        onCheckSelect2: function (oEvent) {
            var oSelectedCheckBox = oEvent.getSource();
            var aGroupCheckBoxes = ["PagoWCuentasP", "PagoWCuentasB"];

            this._handleCheckBoxGroup(oSelectedCheckBox, aGroupCheckBoxes);
        },

        // Lógica para permitir solo un checkbox seleccionado dentro de un grupo
        _handleCheckBoxGroup: function (oSelectedCheckBox, aCheckBoxIds) {
            if (!oSelectedCheckBox.getSelected()) {
                return; // Si el checkbox fue desmarcado, no hacer nada
            }

            var oView = this.getView();
            aCheckBoxIds.forEach(function (sCheckBoxId) {
                var oCheckBox = oView.byId(sCheckBoxId);
                if (oCheckBox && oCheckBox !== oSelectedCheckBox) {
                    oCheckBox.setSelected(false);
                }
            });
        },

        onSociedadChange: function (oEvent) {
            var oInput = oEvent.getSource();
            var sValue = oInput.getValue().toUpperCase(); // Convierte a mayúsculas
            oInput.setValue(sValue);
        },

        onFragment: function () {
            var oView = this.getView();

            // Verificar si el fragmento ya está cargado
            if (!this._oDialog) {
                Fragment.load({
                    id: oView.getId(),  // Esto evita ID duplicados en la vista
                    name: "pluspe.pagodetracsunat.view.Configuracion", // Ruta correcta al fragmento
                    controller: this
                }).then(function (oDialog) {
                    this._oDialog = oDialog;
                    oView.addDependent(oDialog);
                    this._oDialog.open();
                }.bind(this));
            } else {
                this._oDialog.open();
            }
        },

        onCloseDialog: function () {
            if (this._oDialog) {
                this._oDialog.close();
            }
        },

        onEnviar: function () {
            var oView = this.getView();
            var bValid = true;
            var that = this;

            var aCheckBoxes = [
                "ListaDetracPorPagar", "VisualizarLoteDetrac", "AsignarConstDeposito",
                "ListaPagosDetraccion", "PagoWCuentasP", "PagoWCuentasB"
            ];

            var selectedCheckBoxIds = aCheckBoxes.filter(function (id) {
                var oCheckBox = oView.byId(id);
                return oCheckBox ? oCheckBox.getSelected() : false;
            });

            if (selectedCheckBoxIds.length === 0) {
                MessageBox.error("Debe seleccionar al menos un tipo de pago.");
                return;
            }

            var aCamposObligatorios = [
                { id: "Sociedad", mensaje: "La sociedad es obligatoria" },
                { id: "CuentaPagadora", mensaje: "La cuenta pagadora es obligatoria" },
                { id: "DocNotaCred", mensaje: "El documento de nota de crédito es obligatorio" },
                { id: "FechaDesde", mensaje: "La fecha inicial es obligatoria" },
                { id: "ClaseDocFiltrod", mensaje: "Este campo es obligatorio" },
                { id: "CentroBeneficiod", mensaje: "Este campo es obligatorio" }
            ];

            var oData = {};

            aCamposObligatorios.forEach(function (campo) {
                var oInput = oView.byId(campo.id);
                var sValue = oInput.getValue().trim();
                if (!sValue) {
                    oInput.setValueState("Error");
                    oInput.setValueStateText(campo.mensaje);
                    bValid = false;
                } else {
                    oInput.setValueState("None");
                    oData[campo.id] = sValue;
                }
            });

            if (!bValid) {
                MessageBox.error("Por favor complete los campos obligatorios.");
                return;
            }

            oData.FechaDesde = this.byId("FechaDesde").getValue();
            oData.FechaHasta = this.byId("FechaHasta").getValue();
            oData.OpcPos = selectedCheckBoxIds[0];
            oData.MedPago = selectedCheckBoxIds[1];
            oData.ClaseDocFiltroh = selectedCheckBoxIds[2];

            console.log(oData);
        }
    });
});
