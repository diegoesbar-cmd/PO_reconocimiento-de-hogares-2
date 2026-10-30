/* GENERADO por herramientas/convertir_xlsform.py a partir del XLSForm. No editar a mano. */
(window.CUESTIONARIOS = window.CUESTIONARIOS || {})["clinica"] = {
 "meta": {
  "titulo": "Inventario de clínica: equipamiento y medicamentos",
  "clave": "clinica",
  "formId": "inventario_clinica",
  "version": "2026.10.29",
  "inicio": "inicio",
  "fin": "fin"
 },
 "listas": {
  "equip": [
   ["existe_opera", "Existe y opera"],
   ["existe_no_opera", "Existe pero no opera"],
   ["no_existe", "No existe"]
  ],
  "equip_na": [
   ["existe_opera", "Existe y opera"],
   ["existe_no_opera", "Existe pero no opera"],
   ["no_existe", "No existe"],
   ["no_aplica", "No aplica"]
  ]
 },
 "pasos": [
  {
   "id": "paso1",
   "titulo": "Datos de la visita",
   "items": [
    {
     "name": "clinica_id",
     "type": "text",
     "label": "ID de la clínica",
     "hint": "Clave única: CLUES o una clave corta sin espacios, por ejemplo OAX-MIX-C01",
     "required": true,
     "constraint": "regex(., '^[A-Za-z0-9_-]+$')",
     "constraintMsg": "Use sólo letras, números, guion o guion bajo."
    },
    {
     "name": "nombre_clinica",
     "type": "text",
     "label": "Nombre de la clínica o unidad",
     "required": true
    },
    {
     "name": "municipio",
     "type": "text",
     "label": "Municipio",
     "required": true
    },
    {
     "name": "localidad",
     "type": "text",
     "label": "Localidad o comunidad",
     "required": true
    },
    {
     "name": "fecha_visita",
     "type": "date",
     "label": "Fecha de visita",
     "required": true
    },
    {
     "name": "hora_visita",
     "type": "time",
     "label": "Hora aproximada",
     "required": true
    },
    {
     "name": "investigador",
     "type": "text",
     "label": "Nombre de la persona investigadora",
     "required": true
    },
    {
     "name": "persona_atiende",
     "type": "text",
     "label": "Nombre y cargo de la persona que atendió la verificación"
    }
   ]
  },
  {
   "id": "infra_mob",
   "titulo": "Infraestructura y mobiliario",
   "items": [
    {
     "name": "nota_a",
     "type": "note",
     "label": "A. Infraestructura del consultorio (6.1)"
    },
    {
     "name": "infra_area_fisica",
     "type": "select_one",
     "label": "Área física del consultorio",
     "required": true,
     "list": "equip"
    },
    {
     "name": "infra_area_fisica_obs",
     "type": "text",
     "label": "Observaciones",
     "relevant": "${infra_area_fisica} = 'existe_no_opera' or ${infra_area_fisica} = 'no_existe'"
    },
    {
     "name": "infra_lavamanos",
     "type": "select_one",
     "label": "Lavamanos funcional",
     "required": true,
     "list": "equip"
    },
    {
     "name": "infra_lavamanos_obs",
     "type": "text",
     "label": "Observaciones",
     "relevant": "${infra_lavamanos} = 'existe_no_opera' or ${infra_lavamanos} = 'no_existe'"
    },
    {
     "name": "infra_iluminacion",
     "type": "select_one",
     "label": "Iluminación y ventilación adecuadas",
     "required": true,
     "list": "equip"
    },
    {
     "name": "infra_iluminacion_obs",
     "type": "text",
     "label": "Observaciones",
     "relevant": "${infra_iluminacion} = 'existe_no_opera' or ${infra_iluminacion} = 'no_existe'"
    },
    {
     "name": "infra_mobiliario_expediente",
     "type": "select_one",
     "label": "Mobiliario para expediente y material",
     "required": true,
     "list": "equip"
    },
    {
     "name": "infra_mobiliario_expediente_obs",
     "type": "text",
     "label": "Observaciones",
     "relevant": "${infra_mobiliario_expediente} = 'existe_no_opera' or ${infra_mobiliario_expediente} = 'no_existe'"
    },
    {
     "name": "nota_b",
     "type": "note",
     "label": "B. Mobiliario"
    },
    {
     "name": "mob_mesa_exploracion",
     "type": "select_one",
     "label": "Mesa de exploración",
     "required": true,
     "list": "equip"
    },
    {
     "name": "mob_mesa_exploracion_obs",
     "type": "text",
     "label": "Observaciones",
     "relevant": "${mob_mesa_exploracion} = 'existe_no_opera' or ${mob_mesa_exploracion} = 'no_existe'"
    },
    {
     "name": "mob_banco_medico",
     "type": "select_one",
     "label": "Banco para médico",
     "required": true,
     "list": "equip"
    },
    {
     "name": "mob_banco_medico_obs",
     "type": "text",
     "label": "Observaciones",
     "relevant": "${mob_banco_medico} = 'existe_no_opera' or ${mob_banco_medico} = 'no_existe'"
    },
    {
     "name": "mob_banco_paciente",
     "type": "select_one",
     "label": "Banco o escalón para paciente",
     "required": true,
     "list": "equip"
    },
    {
     "name": "mob_banco_paciente_obs",
     "type": "text",
     "label": "Observaciones",
     "relevant": "${mob_banco_paciente} = 'existe_no_opera' or ${mob_banco_paciente} = 'no_existe'"
    },
    {
     "name": "mob_sillas",
     "type": "select_one",
     "label": "Sillas para paciente y acompañante",
     "required": true,
     "list": "equip"
    },
    {
     "name": "mob_sillas_obs",
     "type": "text",
     "label": "Observaciones",
     "relevant": "${mob_sillas} = 'existe_no_opera' or ${mob_sillas} = 'no_existe'"
    },
    {
     "name": "mob_mesa_mayo",
     "type": "select_one",
     "label": "Mesa auxiliar o de Mayo",
     "required": true,
     "list": "equip"
    },
    {
     "name": "mob_mesa_mayo_obs",
     "type": "text",
     "label": "Observaciones",
     "relevant": "${mob_mesa_mayo} = 'existe_no_opera' or ${mob_mesa_mayo} = 'no_existe'"
    }
   ]
  },
  {
   "id": "diagnostico",
   "titulo": "Equipo de diagnóstico y exploración",
   "items": [
    {
     "name": "nota_c",
     "type": "note",
     "label": "C. Equipo de diagnóstico y exploración"
    },
    {
     "name": "diag_bascula",
     "type": "select_one",
     "label": "Báscula con estadímetro",
     "required": true,
     "list": "equip"
    },
    {
     "name": "diag_bascula_obs",
     "type": "text",
     "label": "Observaciones",
     "relevant": "${diag_bascula} = 'existe_no_opera' or ${diag_bascula} = 'no_existe'"
    },
    {
     "name": "diag_estetoscopio",
     "type": "select_one",
     "label": "Estetoscopio",
     "required": true,
     "list": "equip"
    },
    {
     "name": "diag_estetoscopio_obs",
     "type": "text",
     "label": "Observaciones",
     "relevant": "${diag_estetoscopio} = 'existe_no_opera' or ${diag_estetoscopio} = 'no_existe'"
    },
    {
     "name": "diag_esfigmomanometro",
     "type": "select_one",
     "label": "Esfigmomanómetro",
     "required": true,
     "list": "equip"
    },
    {
     "name": "diag_esfigmomanometro_obs",
     "type": "text",
     "label": "Observaciones",
     "relevant": "${diag_esfigmomanometro} = 'existe_no_opera' or ${diag_esfigmomanometro} = 'no_existe'"
    },
    {
     "name": "diag_termometro",
     "type": "select_one",
     "label": "Termómetro clínico",
     "required": true,
     "list": "equip"
    },
    {
     "name": "diag_termometro_obs",
     "type": "text",
     "label": "Observaciones",
     "relevant": "${diag_termometro} = 'existe_no_opera' or ${diag_termometro} = 'no_existe'"
    },
    {
     "name": "diag_otoscopio",
     "type": "select_one",
     "label": "Otoscopio",
     "required": true,
     "list": "equip"
    },
    {
     "name": "diag_otoscopio_obs",
     "type": "text",
     "label": "Observaciones",
     "relevant": "${diag_otoscopio} = 'existe_no_opera' or ${diag_otoscopio} = 'no_existe'"
    },
    {
     "name": "diag_oftalmoscopio",
     "type": "select_one",
     "label": "Oftalmoscopio",
     "required": true,
     "list": "equip"
    },
    {
     "name": "diag_oftalmoscopio_obs",
     "type": "text",
     "label": "Observaciones",
     "relevant": "${diag_oftalmoscopio} = 'existe_no_opera' or ${diag_oftalmoscopio} = 'no_existe'"
    },
    {
     "name": "diag_martillo",
     "type": "select_one",
     "label": "Martillo de reflejos",
     "required": true,
     "list": "equip"
    },
    {
     "name": "diag_martillo_obs",
     "type": "text",
     "label": "Observaciones",
     "relevant": "${diag_martillo} = 'existe_no_opera' or ${diag_martillo} = 'no_existe'"
    },
    {
     "name": "diag_cinta_metrica",
     "type": "select_one",
     "label": "Cinta métrica",
     "required": true,
     "list": "equip"
    },
    {
     "name": "diag_cinta_metrica_obs",
     "type": "text",
     "label": "Observaciones",
     "relevant": "${diag_cinta_metrica} = 'existe_no_opera' or ${diag_cinta_metrica} = 'no_existe'"
    },
    {
     "name": "diag_lampara",
     "type": "select_one",
     "label": "Lámpara de exploración",
     "required": true,
     "list": "equip"
    },
    {
     "name": "diag_lampara_obs",
     "type": "text",
     "label": "Observaciones",
     "relevant": "${diag_lampara} = 'existe_no_opera' or ${diag_lampara} = 'no_existe'"
    },
    {
     "name": "diag_negatoscopio",
     "type": "select_one",
     "label": "Negatoscopio (cuando aplique)",
     "required": true,
     "list": "equip_na"
    },
    {
     "name": "diag_negatoscopio_obs",
     "type": "text",
     "label": "Observaciones",
     "relevant": "${diag_negatoscopio} = 'existe_no_opera' or ${diag_negatoscopio} = 'no_existe'"
    }
   ]
  },
  {
   "id": "instrumental",
   "titulo": "Instrumental y material de curación",
   "items": [
    {
     "name": "nota_d",
     "type": "note",
     "label": "D. Instrumental"
    },
    {
     "name": "inst_estuche",
     "type": "select_one",
     "label": "Estuche de diagnóstico",
     "required": true,
     "list": "equip"
    },
    {
     "name": "inst_estuche_obs",
     "type": "text",
     "label": "Observaciones",
     "relevant": "${inst_estuche} = 'existe_no_opera' or ${inst_estuche} = 'no_existe'"
    },
    {
     "name": "inst_pinzas",
     "type": "select_one",
     "label": "Pinzas",
     "required": true,
     "list": "equip"
    },
    {
     "name": "inst_pinzas_obs",
     "type": "text",
     "label": "Observaciones",
     "relevant": "${inst_pinzas} = 'existe_no_opera' or ${inst_pinzas} = 'no_existe'"
    },
    {
     "name": "inst_tijeras",
     "type": "select_one",
     "label": "Tijeras",
     "required": true,
     "list": "equip"
    },
    {
     "name": "inst_tijeras_obs",
     "type": "text",
     "label": "Observaciones",
     "relevant": "${inst_tijeras} = 'existe_no_opera' or ${inst_tijeras} = 'no_existe'"
    },
    {
     "name": "inst_charolas",
     "type": "select_one",
     "label": "Charolas",
     "required": true,
     "list": "equip"
    },
    {
     "name": "inst_charolas_obs",
     "type": "text",
     "label": "Observaciones",
     "relevant": "${inst_charolas} = 'existe_no_opera' or ${inst_charolas} = 'no_existe'"
    },
    {
     "name": "inst_rinon",
     "type": "select_one",
     "label": "Riñón de acero inoxidable",
     "required": true,
     "list": "equip"
    },
    {
     "name": "inst_rinon_obs",
     "type": "text",
     "label": "Observaciones",
     "relevant": "${inst_rinon} = 'existe_no_opera' or ${inst_rinon} = 'no_existe'"
    },
    {
     "name": "nota_e",
     "type": "note",
     "label": "E. Material para curación"
    },
    {
     "name": "cur_material",
     "type": "select_one",
     "label": "Material de curación conforme a procedimientos realizados",
     "required": true,
     "list": "equip"
    },
    {
     "name": "cur_material_obs",
     "type": "text",
     "label": "Observaciones",
     "relevant": "${cur_material} = 'existe_no_opera' or ${cur_material} = 'no_existe'"
    },
    {
     "name": "cur_punzocortantes",
     "type": "select_one",
     "label": "Contenedor para punzocortantes",
     "required": true,
     "list": "equip"
    },
    {
     "name": "cur_punzocortantes_obs",
     "type": "text",
     "label": "Observaciones",
     "relevant": "${cur_punzocortantes} = 'existe_no_opera' or ${cur_punzocortantes} = 'no_existe'"
    },
    {
     "name": "cur_rpbi",
     "type": "select_one",
     "label": "Recipiente para RPBI",
     "required": true,
     "list": "equip"
    },
    {
     "name": "cur_rpbi_obs",
     "type": "text",
     "label": "Observaciones",
     "relevant": "${cur_rpbi} = 'existe_no_opera' or ${cur_rpbi} = 'no_existe'"
    }
   ]
  },
  {
   "id": "meds1",
   "titulo": "Medicamentos (1 a 14)",
   "items": [
    {
     "name": "g_med01",
     "type": "group",
     "label": "1. Ácido acetilsalicílico, tabletas 100 y 500 mg",
     "items": [
      {
       "name": "med01_cantidad",
       "type": "integer",
       "label": "Cantidad de cajas/unidades",
       "hint": "Escribe 0 si no hay.",
       "required": true,
       "constraint": ". >= 0 and . <= 9999",
       "constraintMsg": "Escribe un número entre 0 y 9999."
      },
      {
       "name": "med01_caducado",
       "type": "decimal",
       "label": "% caducado",
       "hint": "Porcentaje de lo existente que está caducado (0 a 100).",
       "required": true,
       "relevant": "${med01_cantidad} > 0",
       "constraint": ". >= 0 and . <= 100",
       "constraintMsg": "Escribe un porcentaje entre 0 y 100."
      },
      {
       "name": "med01_obs",
       "type": "text",
       "label": "Observaciones",
       "relevant": "${med01_cantidad} >= 0"
      }
     ]
    },
    {
     "name": "g_med02",
     "type": "group",
     "label": "2. Ketorolaco, solución inyectable 30 mg",
     "items": [
      {
       "name": "med02_cantidad",
       "type": "integer",
       "label": "Cantidad de cajas/unidades",
       "hint": "Escribe 0 si no hay.",
       "required": true,
       "constraint": ". >= 0 and . <= 9999",
       "constraintMsg": "Escribe un número entre 0 y 9999."
      },
      {
       "name": "med02_caducado",
       "type": "decimal",
       "label": "% caducado",
       "hint": "Porcentaje de lo existente que está caducado (0 a 100).",
       "required": true,
       "relevant": "${med02_cantidad} > 0",
       "constraint": ". >= 0 and . <= 100",
       "constraintMsg": "Escribe un porcentaje entre 0 y 100."
      },
      {
       "name": "med02_obs",
       "type": "text",
       "label": "Observaciones",
       "relevant": "${med02_cantidad} >= 0"
      }
     ]
    },
    {
     "name": "g_med03",
     "type": "group",
     "label": "3. Metamizol, solución inyectable 500 mg",
     "items": [
      {
       "name": "med03_cantidad",
       "type": "integer",
       "label": "Cantidad de cajas/unidades",
       "hint": "Escribe 0 si no hay.",
       "required": true,
       "constraint": ". >= 0 and . <= 9999",
       "constraintMsg": "Escribe un número entre 0 y 9999."
      },
      {
       "name": "med03_caducado",
       "type": "decimal",
       "label": "% caducado",
       "hint": "Porcentaje de lo existente que está caducado (0 a 100).",
       "required": true,
       "relevant": "${med03_cantidad} > 0",
       "constraint": ". >= 0 and . <= 100",
       "constraintMsg": "Escribe un porcentaje entre 0 y 100."
      },
      {
       "name": "med03_obs",
       "type": "text",
       "label": "Observaciones",
       "relevant": "${med03_cantidad} >= 0"
      }
     ]
    },
    {
     "name": "g_med04",
     "type": "group",
     "label": "4. Paracetamol, tabletas 500 mg",
     "items": [
      {
       "name": "med04_cantidad",
       "type": "integer",
       "label": "Cantidad de cajas/unidades",
       "hint": "Escribe 0 si no hay.",
       "required": true,
       "constraint": ". >= 0 and . <= 9999",
       "constraintMsg": "Escribe un número entre 0 y 9999."
      },
      {
       "name": "med04_caducado",
       "type": "decimal",
       "label": "% caducado",
       "hint": "Porcentaje de lo existente que está caducado (0 a 100).",
       "required": true,
       "relevant": "${med04_cantidad} > 0",
       "constraint": ". >= 0 and . <= 100",
       "constraintMsg": "Escribe un porcentaje entre 0 y 100."
      },
      {
       "name": "med04_obs",
       "type": "text",
       "label": "Observaciones",
       "relevant": "${med04_cantidad} >= 0"
      }
     ]
    },
    {
     "name": "g_med05",
     "type": "group",
     "label": "5. Lidocaína simple, solución inyectable al 2%",
     "items": [
      {
       "name": "med05_cantidad",
       "type": "integer",
       "label": "Cantidad de cajas/unidades",
       "hint": "Escribe 0 si no hay.",
       "required": true,
       "constraint": ". >= 0 and . <= 9999",
       "constraintMsg": "Escribe un número entre 0 y 9999."
      },
      {
       "name": "med05_caducado",
       "type": "decimal",
       "label": "% caducado",
       "hint": "Porcentaje de lo existente que está caducado (0 a 100).",
       "required": true,
       "relevant": "${med05_cantidad} > 0",
       "constraint": ". >= 0 and . <= 100",
       "constraintMsg": "Escribe un porcentaje entre 0 y 100."
      },
      {
       "name": "med05_obs",
       "type": "text",
       "label": "Observaciones",
       "relevant": "${med05_cantidad} >= 0"
      }
     ]
    },
    {
     "name": "g_med06",
     "type": "group",
     "label": "6. Nifedipino, cápsulas 10 mg",
     "items": [
      {
       "name": "med06_cantidad",
       "type": "integer",
       "label": "Cantidad de cajas/unidades",
       "hint": "Escribe 0 si no hay.",
       "required": true,
       "constraint": ". >= 0 and . <= 9999",
       "constraintMsg": "Escribe un número entre 0 y 9999."
      },
      {
       "name": "med06_caducado",
       "type": "decimal",
       "label": "% caducado",
       "hint": "Porcentaje de lo existente que está caducado (0 a 100).",
       "required": true,
       "relevant": "${med06_cantidad} > 0",
       "constraint": ". >= 0 and . <= 100",
       "constraintMsg": "Escribe un porcentaje entre 0 y 100."
      },
      {
       "name": "med06_obs",
       "type": "text",
       "label": "Observaciones",
       "relevant": "${med06_cantidad} >= 0"
      }
     ]
    },
    {
     "name": "g_med07",
     "type": "group",
     "label": "7. Trinitrato de glicerilo, solución inyectable 50 mg/10 ml",
     "items": [
      {
       "name": "med07_cantidad",
       "type": "integer",
       "label": "Cantidad de cajas/unidades",
       "hint": "Escribe 0 si no hay.",
       "required": true,
       "constraint": ". >= 0 and . <= 9999",
       "constraintMsg": "Escribe un número entre 0 y 9999."
      },
      {
       "name": "med07_caducado",
       "type": "decimal",
       "label": "% caducado",
       "hint": "Porcentaje de lo existente que está caducado (0 a 100).",
       "required": true,
       "relevant": "${med07_cantidad} > 0",
       "constraint": ". >= 0 and . <= 100",
       "constraintMsg": "Escribe un porcentaje entre 0 y 100."
      },
      {
       "name": "med07_obs",
       "type": "text",
       "label": "Observaciones",
       "relevant": "${med07_cantidad} >= 0"
      }
     ]
    },
    {
     "name": "g_med08",
     "type": "group",
     "label": "8. Trinitrato de glicerilo, cápsulas o tabletas masticables 6.8 mg",
     "items": [
      {
       "name": "med08_cantidad",
       "type": "integer",
       "label": "Cantidad de cajas/unidades",
       "hint": "Escribe 0 si no hay.",
       "required": true,
       "constraint": ". >= 0 and . <= 9999",
       "constraintMsg": "Escribe un número entre 0 y 9999."
      },
      {
       "name": "med08_caducado",
       "type": "decimal",
       "label": "% caducado",
       "hint": "Porcentaje de lo existente que está caducado (0 a 100).",
       "required": true,
       "relevant": "${med08_cantidad} > 0",
       "constraint": ". >= 0 and . <= 100",
       "constraintMsg": "Escribe un porcentaje entre 0 y 100."
      },
      {
       "name": "med08_obs",
       "type": "text",
       "label": "Observaciones",
       "relevant": "${med08_cantidad} >= 0"
      }
     ]
    },
    {
     "name": "g_med09",
     "type": "group",
     "label": "9. Difenhidramina, solución oral",
     "items": [
      {
       "name": "med09_cantidad",
       "type": "integer",
       "label": "Cantidad de cajas/unidades",
       "hint": "Escribe 0 si no hay.",
       "required": true,
       "constraint": ". >= 0 and . <= 9999",
       "constraintMsg": "Escribe un número entre 0 y 9999."
      },
      {
       "name": "med09_caducado",
       "type": "decimal",
       "label": "% caducado",
       "hint": "Porcentaje de lo existente que está caducado (0 a 100).",
       "required": true,
       "relevant": "${med09_cantidad} > 0",
       "constraint": ". >= 0 and . <= 100",
       "constraintMsg": "Escribe un porcentaje entre 0 y 100."
      },
      {
       "name": "med09_obs",
       "type": "text",
       "label": "Observaciones",
       "relevant": "${med09_cantidad} >= 0"
      }
     ]
    },
    {
     "name": "g_med10",
     "type": "group",
     "label": "10. Epinefrina, solución inyectable 1 mg (1:1000/ml)",
     "items": [
      {
       "name": "med10_cantidad",
       "type": "integer",
       "label": "Cantidad de cajas/unidades",
       "hint": "Escribe 0 si no hay.",
       "required": true,
       "constraint": ". >= 0 and . <= 9999",
       "constraintMsg": "Escribe un número entre 0 y 9999."
      },
      {
       "name": "med10_caducado",
       "type": "decimal",
       "label": "% caducado",
       "hint": "Porcentaje de lo existente que está caducado (0 a 100).",
       "required": true,
       "relevant": "${med10_cantidad} > 0",
       "constraint": ". >= 0 and . <= 100",
       "constraintMsg": "Escribe un porcentaje entre 0 y 100."
      },
      {
       "name": "med10_obs",
       "type": "text",
       "label": "Observaciones",
       "relevant": "${med10_cantidad} >= 0"
      }
     ]
    },
    {
     "name": "g_med11",
     "type": "group",
     "label": "11. Acetato de metilprednisolona, solución inyectable 40 mg",
     "items": [
      {
       "name": "med11_cantidad",
       "type": "integer",
       "label": "Cantidad de cajas/unidades",
       "hint": "Escribe 0 si no hay.",
       "required": true,
       "constraint": ". >= 0 and . <= 9999",
       "constraintMsg": "Escribe un número entre 0 y 9999."
      },
      {
       "name": "med11_caducado",
       "type": "decimal",
       "label": "% caducado",
       "hint": "Porcentaje de lo existente que está caducado (0 a 100).",
       "required": true,
       "relevant": "${med11_cantidad} > 0",
       "constraint": ". >= 0 and . <= 100",
       "constraintMsg": "Escribe un porcentaje entre 0 y 100."
      },
      {
       "name": "med11_obs",
       "type": "text",
       "label": "Observaciones",
       "relevant": "${med11_cantidad} >= 0"
      }
     ]
    },
    {
     "name": "g_med12",
     "type": "group",
     "label": "12. Butilhioscina, solución inyectable 20 mg",
     "items": [
      {
       "name": "med12_cantidad",
       "type": "integer",
       "label": "Cantidad de cajas/unidades",
       "hint": "Escribe 0 si no hay.",
       "required": true,
       "constraint": ". >= 0 and . <= 9999",
       "constraintMsg": "Escribe un número entre 0 y 9999."
      },
      {
       "name": "med12_caducado",
       "type": "decimal",
       "label": "% caducado",
       "hint": "Porcentaje de lo existente que está caducado (0 a 100).",
       "required": true,
       "relevant": "${med12_cantidad} > 0",
       "constraint": ". >= 0 and . <= 100",
       "constraintMsg": "Escribe un porcentaje entre 0 y 100."
      },
      {
       "name": "med12_obs",
       "type": "text",
       "label": "Observaciones",
       "relevant": "${med12_cantidad} >= 0"
      }
     ]
    },
    {
     "name": "g_med13",
     "type": "group",
     "label": "13. Ergonovina, solución inyectable 0.2 mg",
     "items": [
      {
       "name": "med13_cantidad",
       "type": "integer",
       "label": "Cantidad de cajas/unidades",
       "hint": "Escribe 0 si no hay.",
       "required": true,
       "constraint": ". >= 0 and . <= 9999",
       "constraintMsg": "Escribe un número entre 0 y 9999."
      },
      {
       "name": "med13_caducado",
       "type": "decimal",
       "label": "% caducado",
       "hint": "Porcentaje de lo existente que está caducado (0 a 100).",
       "required": true,
       "relevant": "${med13_cantidad} > 0",
       "constraint": ". >= 0 and . <= 100",
       "constraintMsg": "Escribe un porcentaje entre 0 y 100."
      },
      {
       "name": "med13_obs",
       "type": "text",
       "label": "Observaciones",
       "relevant": "${med13_cantidad} >= 0"
      }
     ]
    },
    {
     "name": "g_med14",
     "type": "group",
     "label": "14. Oxitocina, solución inyectable 5 UI",
     "items": [
      {
       "name": "med14_cantidad",
       "type": "integer",
       "label": "Cantidad de cajas/unidades",
       "hint": "Escribe 0 si no hay.",
       "required": true,
       "constraint": ". >= 0 and . <= 9999",
       "constraintMsg": "Escribe un número entre 0 y 9999."
      },
      {
       "name": "med14_caducado",
       "type": "decimal",
       "label": "% caducado",
       "hint": "Porcentaje de lo existente que está caducado (0 a 100).",
       "required": true,
       "relevant": "${med14_cantidad} > 0",
       "constraint": ". >= 0 and . <= 100",
       "constraintMsg": "Escribe un porcentaje entre 0 y 100."
      },
      {
       "name": "med14_obs",
       "type": "text",
       "label": "Observaciones",
       "relevant": "${med14_cantidad} >= 0"
      }
     ]
    }
   ],
   "hint": "Basado en el Apéndice Normativo A de la NOM-005-SSA3-2010 (medicamentos requeridos)."
  },
  {
   "id": "meds2",
   "titulo": "Medicamentos (15 a 27)",
   "items": [
    {
     "name": "g_med15",
     "type": "group",
     "label": "15. Flumazenil, solución inyectable 0.5 mg",
     "items": [
      {
       "name": "med15_cantidad",
       "type": "integer",
       "label": "Cantidad de cajas/unidades",
       "hint": "Escribe 0 si no hay.",
       "required": true,
       "constraint": ". >= 0 and . <= 9999",
       "constraintMsg": "Escribe un número entre 0 y 9999."
      },
      {
       "name": "med15_caducado",
       "type": "decimal",
       "label": "% caducado",
       "hint": "Porcentaje de lo existente que está caducado (0 a 100).",
       "required": true,
       "relevant": "${med15_cantidad} > 0",
       "constraint": ". >= 0 and . <= 100",
       "constraintMsg": "Escribe un porcentaje entre 0 y 100."
      },
      {
       "name": "med15_obs",
       "type": "text",
       "label": "Observaciones",
       "relevant": "${med15_cantidad} >= 0"
      }
     ]
    },
    {
     "name": "g_med16",
     "type": "group",
     "label": "16. Naloxona, solución inyectable 0.4 mg",
     "items": [
      {
       "name": "med16_cantidad",
       "type": "integer",
       "label": "Cantidad de cajas/unidades",
       "hint": "Escribe 0 si no hay.",
       "required": true,
       "constraint": ". >= 0 and . <= 9999",
       "constraintMsg": "Escribe un número entre 0 y 9999."
      },
      {
       "name": "med16_caducado",
       "type": "decimal",
       "label": "% caducado",
       "hint": "Porcentaje de lo existente que está caducado (0 a 100).",
       "required": true,
       "relevant": "${med16_cantidad} > 0",
       "constraint": ". >= 0 and . <= 100",
       "constraintMsg": "Escribe un porcentaje entre 0 y 100."
      },
      {
       "name": "med16_obs",
       "type": "text",
       "label": "Observaciones",
       "relevant": "${med16_cantidad} >= 0"
      }
     ]
    },
    {
     "name": "g_med17",
     "type": "group",
     "label": "17. Furosemida, solución inyectable 20 mg",
     "items": [
      {
       "name": "med17_cantidad",
       "type": "integer",
       "label": "Cantidad de cajas/unidades",
       "hint": "Escribe 0 si no hay.",
       "required": true,
       "constraint": ". >= 0 and . <= 9999",
       "constraintMsg": "Escribe un número entre 0 y 9999."
      },
      {
       "name": "med17_caducado",
       "type": "decimal",
       "label": "% caducado",
       "hint": "Porcentaje de lo existente que está caducado (0 a 100).",
       "required": true,
       "relevant": "${med17_cantidad} > 0",
       "constraint": ". >= 0 and . <= 100",
       "constraintMsg": "Escribe un porcentaje entre 0 y 100."
      },
      {
       "name": "med17_obs",
       "type": "text",
       "label": "Observaciones",
       "relevant": "${med17_cantidad} >= 0"
      }
     ]
    },
    {
     "name": "g_med18",
     "type": "group",
     "label": "18. Salbutamol, spray",
     "items": [
      {
       "name": "med18_cantidad",
       "type": "integer",
       "label": "Cantidad de cajas/unidades",
       "hint": "Escribe 0 si no hay.",
       "required": true,
       "constraint": ". >= 0 and . <= 9999",
       "constraintMsg": "Escribe un número entre 0 y 9999."
      },
      {
       "name": "med18_caducado",
       "type": "decimal",
       "label": "% caducado",
       "hint": "Porcentaje de lo existente que está caducado (0 a 100).",
       "required": true,
       "relevant": "${med18_cantidad} > 0",
       "constraint": ". >= 0 and . <= 100",
       "constraintMsg": "Escribe un porcentaje entre 0 y 100."
      },
      {
       "name": "med18_obs",
       "type": "text",
       "label": "Observaciones",
       "relevant": "${med18_cantidad} >= 0"
      }
     ]
    },
    {
     "name": "g_med19",
     "type": "group",
     "label": "19. Diazepam, solución inyectable 10 mg",
     "items": [
      {
       "name": "med19_cantidad",
       "type": "integer",
       "label": "Cantidad de cajas/unidades",
       "hint": "Escribe 0 si no hay.",
       "required": true,
       "constraint": ". >= 0 and . <= 9999",
       "constraintMsg": "Escribe un número entre 0 y 9999."
      },
      {
       "name": "med19_caducado",
       "type": "decimal",
       "label": "% caducado",
       "hint": "Porcentaje de lo existente que está caducado (0 a 100).",
       "required": true,
       "relevant": "${med19_cantidad} > 0",
       "constraint": ". >= 0 and . <= 100",
       "constraintMsg": "Escribe un porcentaje entre 0 y 100."
      },
      {
       "name": "med19_obs",
       "type": "text",
       "label": "Observaciones",
       "relevant": "${med19_cantidad} >= 0"
      }
     ]
    },
    {
     "name": "g_med20",
     "type": "group",
     "label": "20. Difenidol, solución inyectable 40 mg",
     "items": [
      {
       "name": "med20_cantidad",
       "type": "integer",
       "label": "Cantidad de cajas/unidades",
       "hint": "Escribe 0 si no hay.",
       "required": true,
       "constraint": ". >= 0 and . <= 9999",
       "constraintMsg": "Escribe un número entre 0 y 9999."
      },
      {
       "name": "med20_caducado",
       "type": "decimal",
       "label": "% caducado",
       "hint": "Porcentaje de lo existente que está caducado (0 a 100).",
       "required": true,
       "relevant": "${med20_cantidad} > 0",
       "constraint": ". >= 0 and . <= 100",
       "constraintMsg": "Escribe un porcentaje entre 0 y 100."
      },
      {
       "name": "med20_obs",
       "type": "text",
       "label": "Observaciones",
       "relevant": "${med20_cantidad} >= 0"
      }
     ]
    },
    {
     "name": "g_med21",
     "type": "group",
     "label": "21. Dimenhidrinato, solución inyectable 50 mg",
     "items": [
      {
       "name": "med21_cantidad",
       "type": "integer",
       "label": "Cantidad de cajas/unidades",
       "hint": "Escribe 0 si no hay.",
       "required": true,
       "constraint": ". >= 0 and . <= 9999",
       "constraintMsg": "Escribe un número entre 0 y 9999."
      },
      {
       "name": "med21_caducado",
       "type": "decimal",
       "label": "% caducado",
       "hint": "Porcentaje de lo existente que está caducado (0 a 100).",
       "required": true,
       "relevant": "${med21_cantidad} > 0",
       "constraint": ". >= 0 and . <= 100",
       "constraintMsg": "Escribe un porcentaje entre 0 y 100."
      },
      {
       "name": "med21_obs",
       "type": "text",
       "label": "Observaciones",
       "relevant": "${med21_cantidad} >= 0"
      }
     ]
    },
    {
     "name": "g_med22",
     "type": "group",
     "label": "22. Haloperidol, solución inyectable 50 mg",
     "items": [
      {
       "name": "med22_cantidad",
       "type": "integer",
       "label": "Cantidad de cajas/unidades",
       "hint": "Escribe 0 si no hay.",
       "required": true,
       "constraint": ". >= 0 and . <= 9999",
       "constraintMsg": "Escribe un número entre 0 y 9999."
      },
      {
       "name": "med22_caducado",
       "type": "decimal",
       "label": "% caducado",
       "hint": "Porcentaje de lo existente que está caducado (0 a 100).",
       "required": true,
       "relevant": "${med22_cantidad} > 0",
       "constraint": ". >= 0 and . <= 100",
       "constraintMsg": "Escribe un porcentaje entre 0 y 100."
      },
      {
       "name": "med22_obs",
       "type": "text",
       "label": "Observaciones",
       "relevant": "${med22_cantidad} >= 0"
      }
     ]
    },
    {
     "name": "g_med23",
     "type": "group",
     "label": "23. Agua bidestilada, solución inyectable 2 ml",
     "items": [
      {
       "name": "med23_cantidad",
       "type": "integer",
       "label": "Cantidad de cajas/unidades",
       "hint": "Escribe 0 si no hay.",
       "required": true,
       "constraint": ". >= 0 and . <= 9999",
       "constraintMsg": "Escribe un número entre 0 y 9999."
      },
      {
       "name": "med23_caducado",
       "type": "decimal",
       "label": "% caducado",
       "hint": "Porcentaje de lo existente que está caducado (0 a 100).",
       "required": true,
       "relevant": "${med23_cantidad} > 0",
       "constraint": ". >= 0 and . <= 100",
       "constraintMsg": "Escribe un porcentaje entre 0 y 100."
      },
      {
       "name": "med23_obs",
       "type": "text",
       "label": "Observaciones",
       "relevant": "${med23_cantidad} >= 0"
      }
     ]
    },
    {
     "name": "g_med24",
     "type": "group",
     "label": "24. Cloruro de sodio al 0.9%",
     "items": [
      {
       "name": "med24_cantidad",
       "type": "integer",
       "label": "Cantidad de cajas/unidades",
       "hint": "Escribe 0 si no hay.",
       "required": true,
       "constraint": ". >= 0 and . <= 9999",
       "constraintMsg": "Escribe un número entre 0 y 9999."
      },
      {
       "name": "med24_caducado",
       "type": "decimal",
       "label": "% caducado",
       "hint": "Porcentaje de lo existente que está caducado (0 a 100).",
       "required": true,
       "relevant": "${med24_cantidad} > 0",
       "constraint": ". >= 0 and . <= 100",
       "constraintMsg": "Escribe un porcentaje entre 0 y 100."
      },
      {
       "name": "med24_obs",
       "type": "text",
       "label": "Observaciones",
       "relevant": "${med24_cantidad} >= 0"
      }
     ]
    },
    {
     "name": "g_med25",
     "type": "group",
     "label": "25. Glucosa al 5%, 10% y 50%",
     "items": [
      {
       "name": "med25_cantidad",
       "type": "integer",
       "label": "Cantidad de cajas/unidades",
       "hint": "Escribe 0 si no hay.",
       "required": true,
       "constraint": ". >= 0 and . <= 9999",
       "constraintMsg": "Escribe un número entre 0 y 9999."
      },
      {
       "name": "med25_caducado",
       "type": "decimal",
       "label": "% caducado",
       "hint": "Porcentaje de lo existente que está caducado (0 a 100).",
       "required": true,
       "relevant": "${med25_cantidad} > 0",
       "constraint": ". >= 0 and . <= 100",
       "constraintMsg": "Escribe un porcentaje entre 0 y 100."
      },
      {
       "name": "med25_obs",
       "type": "text",
       "label": "Observaciones",
       "relevant": "${med25_cantidad} >= 0"
      }
     ]
    },
    {
     "name": "g_med26",
     "type": "group",
     "label": "26. Polimerizado de gelatina 4 g/100 ml",
     "items": [
      {
       "name": "med26_cantidad",
       "type": "integer",
       "label": "Cantidad de cajas/unidades",
       "hint": "Escribe 0 si no hay.",
       "required": true,
       "constraint": ". >= 0 and . <= 9999",
       "constraintMsg": "Escribe un número entre 0 y 9999."
      },
      {
       "name": "med26_caducado",
       "type": "decimal",
       "label": "% caducado",
       "hint": "Porcentaje de lo existente que está caducado (0 a 100).",
       "required": true,
       "relevant": "${med26_cantidad} > 0",
       "constraint": ". >= 0 and . <= 100",
       "constraintMsg": "Escribe un porcentaje entre 0 y 100."
      },
      {
       "name": "med26_obs",
       "type": "text",
       "label": "Observaciones",
       "relevant": "${med26_cantidad} >= 0"
      }
     ]
    },
    {
     "name": "g_med27",
     "type": "group",
     "label": "27. Solución de Hartmann",
     "items": [
      {
       "name": "med27_cantidad",
       "type": "integer",
       "label": "Cantidad de cajas/unidades",
       "hint": "Escribe 0 si no hay.",
       "required": true,
       "constraint": ". >= 0 and . <= 9999",
       "constraintMsg": "Escribe un número entre 0 y 9999."
      },
      {
       "name": "med27_caducado",
       "type": "decimal",
       "label": "% caducado",
       "hint": "Porcentaje de lo existente que está caducado (0 a 100).",
       "required": true,
       "relevant": "${med27_cantidad} > 0",
       "constraint": ". >= 0 and . <= 100",
       "constraintMsg": "Escribe un porcentaje entre 0 y 100."
      },
      {
       "name": "med27_obs",
       "type": "text",
       "label": "Observaciones",
       "relevant": "${med27_cantidad} >= 0"
      }
     ]
    }
   ],
   "hint": "Basado en el Apéndice Normativo A de la NOM-005-SSA3-2010 (medicamentos requeridos)."
  }
 ]
};
