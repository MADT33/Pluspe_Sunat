sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], (Controller, MessageToast, MessageBox, JSONModel, Filter, FilterOperator) => {
    "use strict";

    return Controller.extend("pluspe.pagodetracsunat.controller.Detalle", {
        onInit: function () {

            // Obtener el modelo global que fue asignado en la vista anterior
            var oGlobalModel = sap.ui.getCore().getModel("globalModel");
           

            // Verificar si el modelo global está disponible
            if (oGlobalModel) {
                // Asignar el modelo global a la vista de detalle
                this.getView().setModel(oGlobalModel, "globalModel");

                // Verificar que ListaAlv contiene datos
                var aListaAlv = oGlobalModel.getProperty("/ListaAlv");
                if (aListaAlv && aListaAlv.length > 0) {
                    console.log("Datos de ListaAlv:", aListaAlv);
                } else {
                    console.error("No se encontraron datos en ListaAlv.");
                }
            } else {
                console.error("El modelo global no está disponible.");
            }

            // Verificar el componente
            var oComponent = this.getOwnerComponent();
            if (oComponent) {
                console.log("Componente encontrado");
            } else {
                console.error("Componente no disponible");
            }
        },
        onNavBack: function () {
            this.getOwnerComponent().getRouter().navTo("RouteView");

        },
        onReproceso: function () {

            var oModel = this.getOwnerComponent().getModel();
            var sPath = "/RepSinLoteTxtSet";

            var oModeloData = this.getView().getModel("globalModel").getProperty("/data/0");
            var oModelEnity = oModel.oData["SunatImSet(Sociedad='AR10',MedPago='PagoWCuentasB',CuentaPagadora='0011112182',DocNotaCred='12',ClaseDocFiltrod='AA',CentroBeneficiod='AR1010')"];
            var sociedad = oModeloData.C_Code;
            var ano = oModeloData.Journal;
            var MedPago =  oModelEnity.MedPago;
            var OpcPos =  oModelEnity.OpcPos;

            var aFilters = [];
            if (sociedad) {
                aFilters.push(new sap.ui.model.Filter("Sociedad", sap.ui.model.FilterOperator.EQ, sociedad));
            }
            if (ano) {
                aFilters.push(new sap.ui.model.Filter("ano", sap.ui.model.FilterOperator.EQ, ano));
            }
            if (MedPago) {
                aFilters.push(new sap.ui.model.Filter("MedPago", sap.ui.model.FilterOperator.EQ, MedPago));
            }
            if (OpcPos) {
                aFilters.push(new sap.ui.model.Filter("OpcPos", sap.ui.model.FilterOperator.EQ, OpcPos));
            }


           

            oModel.read(sPath, {
                filters: aFilters, // Se agregan los filtros aquí
                success: function (oData) {
                    console.log("Datos obtenidos:", oData);

                    // Verificar si oData existe y tiene el campo esperado
                    var sTxtContent = oData?.Txt || (oData?.results?.length > 0 ? oData.results[0].Txt : "");
            
                    if (!sTxtContent) {
                        sap.m.MessageToast.show("No se recibió contenido válido para el archivo.");
                        return;
                    }
            
                    sTxtContent = sTxtContent.replace(/\\n/g, "\n"); // Asegurar saltos de línea
            
                    // Crear un Blob con el contenido del archivo
                    var blob = new Blob([sTxtContent], { type: "text/plain;charset=utf-8" });
            
                    // Crear un enlace para descargar el archivo
                    var link = document.createElement("a");
                    link.href = URL.createObjectURL(blob);
                    link.download = "Reporte.txt"; // Nombre del archivo
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
            
                    // Liberar memoria
                    URL.revokeObjectURL(link.href);
            
                    sap.m.MessageToast.show("Archivo descargado correctamente.");
                },
                error: function (oError) {
                    console.error("Error en la lectura:", oError);
                    sap.m.MessageToast.show("Error al obtener datos del servicio.");
                }
            });
        }

    });
});

