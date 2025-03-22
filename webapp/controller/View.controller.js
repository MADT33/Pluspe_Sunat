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
                        this.getView().byId("idBTNEnviar").setVisible(true);
                        break;

                    case "VisualizarLoteDetrac":
                        this.getView().byId("Panel1").setVisible(false);
                        this.getView().byId("Panel2").setVisible(true);
                        this.getView().byId("Panel3").setVisible(false)
                        this.getView().byId("Panel4").setVisible(false);
                        this.getView().byId("cuentaP").setVisible(false);
                         this.getView().byId("idBTNEnviar").setVisible(false);
                        break;
                    case "AsignarConstDeposito":
                        this.getView().byId("Panel1").setVisible(false);
                        this.getView().byId("Panel2").setVisible(false);
                        this.getView().byId("Panel4").setVisible(false);
                        this.getView().byId("Panel3").setVisible(true);
                        this.getView().byId("cuentaP").setVisible(false);
                        this.getView().byId("idBTNEnviar").setVisible(true);
                        break;
                    case "ListaPagosDetraccion":
                        this.getView().byId("Panel1").setVisible(false);
                        this.getView().byId("Panel2").setVisible(false);
                        this.getView().byId("Panel3").setVisible(false);
                        this.getView().byId("cuentaP").setVisible(false);
                        this.getView().byId("Panel4").setVisible(true);
                        this.getView().byId("idBTNEnviar").setVisible(true);
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
            var sociedad = this.getView().byId("Sociedad").getValue();
            var lote = this.getView().byId("Lote").getValue();
        
            // Validación de campos obligatorios
            if (!oFile || !sociedad || !lote) {
                var mensajeError = "Por favor, complete los siguientes campos obligatorios:\n";
                if (!oFile) mensajeError += "- Archivo\n";
                if (!sociedad) mensajeError += "- Sociedad\n";
                if (!lote) mensajeError += "- Lote\n";
        
                sap.m.MessageBox.warning(mensajeError); // Muestra mensaje de advertencia
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
                    InTxt: sFileContent,
                    Sociedad : sociedad,
                    Lote : lote
                };
        
                oModel.create(sPath, oPayload, {
                    success: function (req) {
                        console.log(req);
                        sap.m.MessageToast.show("Archivo enviado correctamente.");
        
                        var Mensaje = req.Mensaje;
                        var tipoMsj = req.TipoMens;
        
                        if (tipoMsj === "I") {
                            sap.m.MessageBox.information(Mensaje); // Mensaje informativo
                        } else if (tipoMsj === "W") {
                            sap.m.MessageBox.warning(Mensaje); // Mensaje de advertencia
                        } else if (tipoMsj === "E") {
                            sap.m.MessageBox.error(Mensaje); // Mensaje de error
                        } else {
                            sap.m.MessageBox.information("Tipo de mensaje no reconocido: " + Mensaje);
                        }
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
            var oModel = this.getOwnerComponent().getModel();

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
                { id: "Sociedad", mensaje: "La sociedad es obligatoria" }/*,
                { id: "CuentaPagadora", mensaje: "La cuenta pagadora es obligatoria" },
                { id: "DocNotaCred", mensaje: "El documento de nota de crédito es obligatorio" },
                { id: "FechaDesde", mensaje: "La fecha inicial es obligatoria" },
                { id: "ClaseDocFiltrod", mensaje: "Este campo es obligatorio" },
                { id: "CentroBeneficiod", mensaje: "Este campo es obligatorio" }*/
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
            oData.CuentaPagadora = this.byId("CuentaPagadora").getValue();
            oData.OpcPos = selectedCheckBoxIds[0];
            oData.MedPago = selectedCheckBoxIds[1];
            oData.ClaseDocFiltrod = this.byId("ClaseDocFiltrod").getValue();
            oData.ClaseDocFiltroh = this.byId("ClaseDocFiltroh").getValue();           
            oData.CentroBeneficiod = this.byId("CentroBeneficiod").getValue();
            oData.CentroBeneficioh = this.byId("CentroBeneficioh").getValue();
            oData.R3Ejercicio = this.byId("Ejercicio").getValue();              
            oData.R3DocNumD = this.byId("NumDocuD").getValue();             
            oData.R3DocNumH = this.byId("NumDocuH").getValue();            
            oData.R4FecPagD = this.byId("FechaDesdePagos").getValue();              
            oData.R4FecPagH = this.byId("FechaHastaPagos").getValue();             
            oData.R4CenBenD = this.byId("CentroBeneficioPagos").getValue();             
            oData.R4CenBenH = this.byId("CentroBeneficiohPagos").getValue();
            oData.DocNotaCred = this.byId("DocNotaCred").getValue();

            oModel.create("/SunatImSet", oData, {
                success: function (oResponse) {
                    console.log("Datos creados exitosamente:", oResponse);

                    var listAlv = oResponse.ListaAlv;
                    var error = oResponse.Error;

                     

                    if(error){
                        MessageBox.error(error);
                     }else {
                      
                        var oModelSplit = [];                      
                        var alvSplit =  listAlv.split("\n\r\n");

                        alvSplit.forEach((linea) => {
                            var valores = linea.trim().split(";");
                           
                            var obj = {

                                 C_Code : valores[0] || "",
                                 A_Document : valores[1] || "",
                                 F_Year :  valores[2] || "",
                                 Journal : valores[3] || "" , 
                                 Withh: valores[4] || "" , 
                                 PosDate : valores[5] || "" , 
                                 DoctDate : valores[6] || "" , 
                                 Tax_Type : valores[7] || "" , 
                                 B_Partner : valores[8] || "" , 
                                 Tra_Currency : valores[9] || "" , 
                                 A_LCurrency : valores[10] || "" , 
                                 Tax_Base : valores[11] || "" , 
                                 C_Code_Curr : valores[12] || "" , 
                                 Add_Curr : valores[13] || "" , 
                                 AmTrans_Curr : valores[14] || "" , 
                                 AmAdd_Curr :  valores[15] || "" , 
                                 ransaccrcy :  valores[16] || "" , 
                                 CRCY2 :  valores[17] || "" , 
                                 BASECRCY : valores[18] || "" , 
                                 TAXCRCY : valores[19] || "" , 
                                 CODECRCY : valores[20] || "" , 
                                 INCOCRCY :   valores[21] || "" , 
                                 TRANCRCY : valores[22] || "" , 
                                 NADDKCRCY2 : valores[23] || "" , 
                                 NADDKCRCY3 : valores[24] || "" , 
                                 NETAMOUNT : valores[25] || "" , 
                                 NETCRCY : valores[26] || "" , 
                                BASECODECRCY : valores[27] || "" , 
                                GeL_Account : valores[28] || "" , 
                                W_Tax_Rate : valores[29] || "" , 
                                NCCode_Company : valores[30] || "" , 
                                Country : valores[31] || "" , 
                                campo32 : valores[32] || "" , 
                                campo33 : valores[33] || "" , 
                                campo34 : valores[34] || "" , 
                                campo35 : valores[35] || "" , 
                                campo36 : valores[36] || "" , 
                                campo37 : valores[37] || "" , 
                                
                            };
                     

                            oModelSplit.push(obj); // Agregar el objeto al array
                            
                        });
                        if (oModelSplit.length > 0) {
                            var oGlobalModel = new sap.ui.model.json.JSONModel({ data: oModelSplit });
                            sap.ui.getCore().setModel(oGlobalModel, "globalModel");
            
                            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                            if (oRouter) {
                                oRouter.navTo("Detalle");
                            } else {
                                console.error("Router no encontrado");
                            }
                        }
                    }
                }.bind(this), 
                error: function (oError) {
                    console.error("Error al crear datos:", oError);
                }
            });
        
        }
    });
});
