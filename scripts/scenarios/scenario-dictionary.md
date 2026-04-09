# Diccionario de Escenarios

Este documento resume el formato esperado para los archivos JSON de escenario usados por el runner:

```powershell
node scripts/run-scenario.js scripts/scenarios/<archivo>.json
```

## Estructura General

El JSON de entrada tiene estos bloques de primer nivel:

- `company`
- `project`
- `employment`
- `exports`
- `decentralization`
- `sustainability`
- `iplus`
- `strategic`

## company

- `annualBillingUi`: numero
- `employees`: entero
- `sector`: `industria` | `servicios` | `agro` | `turismo`
- `isNew`: `true` | `false`
- `isIndustrialParkUser`: `si` | `no`
- `industrialParkActivity`: `""` | `actividades-industriales` | `servicios-logisticos` | `energia-solar` | `valorizacion-residuos` | `servicios-tic-biotecnologia` | `otras-actividades`

## project

- `ministry`: `miem` | `mef` | `mgap` | `mintur`
- `filedDate`: fecha en formato `YYYY-MM-DD`
- `machineryUi`: numero
- `installationsUi`: numero
- `civilWorksUi`: numero
- `industrialParkUi`: numero

## employment

### employment.base

- `women`: numero
- `youth`: numero
- `disability`: numero
- `others`: numero

### employment.inc

- `total`: numero
- `women`: numero
- `youth`: numero
- `disability`: numero
- `others`: numero

## exports

- `currentExports`: numero
- `exportIncrease`: numero
- `indirectExports`: array de objetos

Cada item de `indirectExports` puede tener:

- `pct`: numero
- `initial`: numero
- `increase`: numero

## decentralization

Objeto cuyas claves posibles son departamentos y cuyos valores son numeros.

Claves válidas:

- `artigas`
- `canelones`
- `cerroLargo`
- `colonia`
- `durazno`
- `flores`
- `florida`
- `lavalleja`
- `maldonado`
- `montevideo`
- `paysandu`
- `rioNegro`
- `rivera`
- `rocha`
- `salto`
- `sanJose`
- `soriano`
- `tacuarembo`
- `treintaYTres`

## sustainability

- `amountUi`: numero
- `certification`: uno de los siguientes valores

Valores posibles de `certification`:

- `none`
- `leed`
- `leed-plata`
- `leed-oro`
- `leed-platino`
- `breeam-bueno`
- `breeam-muy-bueno`
- `breeam-excelente`
- `breeam-excepcional`
- `sello-b`
- `sello-a`

## iplus

- `amountUi`: numero
- `category`: `at` | `inn` | `id` | `none`

## strategic

### Campos generales

- `priorities`: numero
- `mefRenewableInvestmentUi`: numero
- `mineralEligibleInvestmentUi`: numero
- `mineralProcessingLevel`: `""` | `minima` | `intermedia` | `maxima`
- `mineralTransformFlag`: `si` | `no`
- `mineralTransformMinUi`: numero
- `mineralTransformMedUi`: numero
- `mineralTransformMaxUi`: numero
- `nationalComponent`: `si` | `no`
- `nationalGoodsUi`: numero
- `nationalGoodsTotalUi`: numero
- `nationalCivilWorksUi`: numero
- `civilWorksMaterialsUi`: numero

### Campos MGAP

- `mgapRiegoFlag`: `si` | `no`
- `mgapRiegoInvestmentUi`: numero
- `mgapBioFlag`: `si` | `no`
- `mgapBioInvestmentUi`: numero
- `mgapLivestockFlag`: `si` | `no`
- `mgapLivestockImprovement`: array con cero o más de:
  `birth-rate`, `herd-growth`, `flock-growth`
- `mgapLivestockBirthsA`: numero
- `mgapLivestockBreedingAvgB`: numero
- `mgapLivestockIncreasePoints`: numero
- `mgapLivestockHerdFinalA`: numero
- `mgapLivestockHerdAvgB`: numero
- `mgapLivestockHerdIncreasePct`: numero
- `mgapLivestockFlockFinalA`: numero
- `mgapLivestockFlockAvgB`: numero
- `mgapLivestockFlockIncreasePct`: numero
- `mgapNaturalFieldFlag`: `si` | `no`
- `mgapPescaFlag`: `si` | `no`
- `mgapPescaInvestmentUi`: numero

### Campos MINTUR

- `minturStrategicFlag`: `si` | `no`
- `minturInvestmentZoneUi`: numero
- `minturInvestmentOutsideUi`: numero

### Campos MIEM

- `miemEnergyFlag`: `si` | `no`
- `miemEnergyInvestmentUi`: numero
- `miemHydrogenFlag`: `si` | `no`
- `miemHydrogenInvestmentUi`: numero
- `miemWasteFlag`: `si` | `no`
- `miemWasteInvestmentUi`: numero
- `miemWasteTransformMinUi`: numero
- `miemWasteTransformMedUi`: numero
- `miemWasteTransformMaxUi`: numero
- `miemBioFlag`: `si` | `no`
- `miemBioInvestmentUi`: numero
- `miemPharmaFlag`: `si` | `no`
- `miemPharmaInvestmentUi`: numero
- `miemAerospaceFlag`: `si` | `no`
- `miemAerospaceInvestmentUi`: numero
- `miemSatellitesFlag`: `si` | `no`
- `miemSatellitesInvestmentUi`: numero

## Archivos de Referencia

Escenarios completos de ejemplo:

- `scripts/scenarios/mgap-complete.json`
- `scripts/scenarios/mef-complete.json`
- `scripts/scenarios/miem-complete.json`
- `scripts/scenarios/mintur-complete.json`

Diccionario estructurado en JSON:

- `scripts/scenarios/scenario-dictionary.json`
