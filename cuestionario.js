/* GENERADO por herramientas/convertir_xlsform.py a partir del XLSForm. No editar a mano. */
(window.CUESTIONARIOS = window.CUESTIONARIOS || {})["hogares"] = {
 "meta": {
  "titulo": "Reconocimiento de hogares: DM2, HTA y diabetes gestacional",
  "clave": "hogares",
  "formId": "tamiz_hogares_dm2_hta_dg",
  "version": "2026.07.17",
  "inicio": "inicio",
  "fin": "fin"
 },
 "listas": {
  "sino": [
   ["si", "Sí"],
   ["no", "No"]
  ],
  "sino_ns": [
   ["si", "Sí"],
   ["no", "No"],
   ["no_sabe", "No sabe"]
  ],
  "sino_na_ns": [
   ["si", "Sí"],
   ["no", "No"],
   ["no_aplica", "No aplica"],
   ["no_sabe", "No sabe"]
  ],
  "respuesta_salud": [
   ["si", "Sí"],
   ["no", "No"],
   ["no_sabe", "No sabe"],
   ["prefiere_no", "Prefiere no responder"]
  ],
  "fuente": [
   ["salud", "Personal de salud"],
   ["docente", "Docente"],
   ["promotor", "Promotor(a) comunitario(a)"],
   ["recorrido", "Recorrido directo"],
   ["otra", "Otra"]
  ],
  "lengua": [
   ["espanol", "Español"],
   ["tuun_savi", "Tu’un Savi"],
   ["ambas", "Ambas"],
   ["otra", "Otra"],
   ["no_sabe", "No sabe"]
  ],
  "material": [
   ["durable", "Material durable"],
   ["adobe", "Adobe"],
   ["madera_lamina", "Madera o lámina"],
   ["mixto", "Mixto"],
   ["otro", "Otro"]
  ],
  "superficie": [
   ["menor_100", "Menor de 100 m²"],
   ["100_250", "100–250 m²"],
   ["251_500", "251–500 m²"],
   ["mas_500", "Más de 500 m²"],
   ["no_sabe", "No sabe"]
  ],
  "frecuencia": [
   ["si", "Sí"],
   ["no", "No"],
   ["aveces", "A veces"],
   ["no_sabe", "No sabe"]
  ],
  "tortillas": [
   ["casa", "Hechas en casa"],
   ["compradas", "Compradas"],
   ["ambas", "Ambas"],
   ["no_consume", "No consume"],
   ["no_sabe", "No sabe"]
  ],
  "proporcion": [
   ["todo", "Todo el año"],
   ["mas_mitad", "Más de la mitad"],
   ["menos_mitad", "Menos de la mitad"],
   ["temporada", "Sólo temporada"],
   ["casi_nunca", "Casi nunca"]
  ],
  "parentesco": [
   ["jefe", "Jefe(a)"],
   ["pareja", "Pareja"],
   ["hijo", "Hijo(a)"],
   ["padre_madre", "Padre o madre"],
   ["hermano", "Hermano(a)"],
   ["otro_familiar", "Otro familiar"],
   ["no_familiar", "No familiar"]
  ],
  "sexo": [
   ["mujer", "Mujer"],
   ["hombre", "Hombre"],
   ["otro", "Otro"],
   ["prefiere_no", "Prefiere no responder"]
  ],
  "escolaridad": [
   ["sin", "Sin escolaridad"],
   ["prim_inc", "Primaria incompleta"],
   ["prim_comp", "Primaria completa"],
   ["sec", "Secundaria"],
   ["media", "Media superior"],
   ["superior", "Superior"],
   ["posgrado", "Posgrado"],
   ["no_sabe", "No sabe"]
  ],
  "tratamiento": [
   ["si", "Sí"],
   ["no", "No"],
   ["parcial", "Parcialmente"],
   ["no_aplica", "No aplica"],
   ["no_sabe", "No sabe"]
  ],
  "urgencia": [
   ["dolor_pecho", "Dolor de pecho"],
   ["disnea", "Dificultad intensa para respirar"],
   ["debilidad", "Debilidad repentina de un lado"],
   ["habla", "Alteración súbita del habla"],
   ["desmayo", "Desmayo"]
  ],
  "embarazo_estado": [
   ["si", "Sí"],
   ["no", "No"],
   ["no_sabe", "No sabe"],
   ["prefiere_no", "Prefiere no responder"]
  ],
  "alarma_obs": [
   ["cefalea", "Dolor de cabeza intenso o persistente"],
   ["vision", "Luces, manchas o visión borrosa"],
   ["dolor_abd", "Dolor intenso en la parte alta del abdomen o bajo las costillas"],
   ["edema", "Hinchazón súbita de cara o manos"],
   ["disnea_convulsion", "Dificultad para respirar, convulsiones o desmayo"],
   ["sangrado", "Sangrado"],
   ["movimientos", "Disminución marcada de movimientos del bebé"]
  ],
  "prioridad": [
   ["alta", "Alta"],
   ["media", "Media"],
   ["baja", "Baja"],
   ["revision", "Revisión por coordinación"]
  ],
  "invitacion": [
   ["grupo", "Grupo focal"],
   ["caso", "Estudio de caso"],
   ["ambos", "Ambos"],
   ["ninguno", "Ninguno"]
  ],
  "disponibilidad": [
   ["si", "Sí"],
   ["no", "No"],
   ["indeciso", "Indeciso"]
  ],
  "momento": [
   ["manana", "Mañana"],
   ["tarde", "Tarde"],
   ["noche", "Noche"],
   ["otro", "Otro"]
  ]
 },
 "pasos": [
  {
   "id": "paso1",
   "titulo": "Datos de la visita",
   "items": [
    {
     "name": "hogar_id",
     "type": "text",
     "label": "ID del hogar",
     "hint": "Clave única: comunidad + consecutivo, por ejemplo OAX-MIX-001",
     "required": true,
     "constraint": "regex(., '^[A-Za-z0-9_-]+$')",
     "constraintMsg": "Use sólo letras, números, guion o guion bajo."
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
     "name": "barrio",
     "type": "text",
     "label": "Barrio, paraje o zona"
    },
    {
     "name": "fuente_acercamiento",
     "type": "select_one",
     "label": "Fuente de acercamiento al hogar",
     "required": true,
     "list": "fuente"
    },
    {
     "name": "investigador",
     "type": "text",
     "label": "Nombre de la persona investigadora",
     "required": true
    },
    {
     "name": "informante",
     "type": "text",
     "label": "Nombre o iniciales de la persona informante"
    },
    {
     "name": "lengua_preferida",
     "type": "select_one",
     "label": "Lengua preferida para conversar",
     "hint": "El formulario permanece en español; las preguntas pueden formularse oralmente en Tu’un Savi.",
     "required": true,
     "list": "lengua"
    },
    {
     "name": "consiente",
     "type": "select_one",
     "label": "¿Acepta participar en este reconocimiento?",
     "required": true,
     "list": "sino"
    },
    {
     "name": "cierre_no",
     "type": "note",
     "label": "La persona no aceptó participar. Agradezca su tiempo y cierre el formulario.",
     "relevant": "${consiente}='no'"
    }
   ]
  },
  {
   "id": "datos_hogar",
   "titulo": "Datos del hogar",
   "items": [
    {
     "name": "referencia",
     "type": "text",
     "label": "Referencia para volver al hogar",
     "hint": "No solicitar INE ni identificación oficial."
    },
    {
     "name": "telefono",
     "type": "text",
     "label": "Teléfono de contacto",
     "hint": "Opcional; sólo si desea proporcionarlo."
    },
    {
     "name": "material_vivienda",
     "type": "select_one",
     "label": "Material predominante de construcción",
     "required": true,
     "list": "material"
    },
    {
     "name": "espacios_totales",
     "type": "integer",
     "label": "Número de espacios totales",
     "hint": "Incluya cocina, baño, lugar de reunión, dormitorios y pasillos cerrados.",
     "required": true,
     "constraint": ". >= 1",
     "constraintMsg": "Debe ser al menos 1."
    },
    {
     "name": "refrigerador",
     "type": "select_one",
     "label": "¿Hay refrigerador funcional?",
     "required": true,
     "list": "sino_ns"
    },
    {
     "name": "television",
     "type": "select_one",
     "label": "¿Hay televisión funcional?",
     "required": true,
     "list": "sino_ns"
    },
    {
     "name": "estufa_gas",
     "type": "select_one",
     "label": "¿Hay estufa de gas que se use diariamente?",
     "required": true,
     "list": "sino_ns"
    },
    {
     "name": "superficie_solar",
     "type": "select_one",
     "label": "Superficie aproximada del solar",
     "list": "superficie"
    },
    {
     "name": "viviendas_solar",
     "type": "integer",
     "label": "¿Cuántas viviendas hay en este solar?",
     "required": true,
     "constraint": ". >= 1",
     "constraintMsg": "Debe ser al menos 1."
    },
    {
     "name": "obs_vivienda",
     "type": "text",
     "label": "Observaciones sobre la vivienda",
     "multiline": true
    }
   ],
   "relevant": "${consiente}='si'"
  },
  {
   "id": "alimentacion",
   "titulo": "Alimentación y autoconsumo",
   "items": [
    {
     "name": "agua_sola",
     "type": "select_one",
     "label": "¿Toman agua sola durante el día?",
     "required": true,
     "list": "frecuencia"
    },
    {
     "name": "compran_refresco",
     "type": "select_one",
     "label": "¿Compran refrescos?",
     "required": true,
     "list": "frecuencia"
    },
    {
     "name": "refresco_litros",
     "type": "decimal",
     "label": "Consumo aproximado de refresco al día en litros",
     "hint": "Si se registra por botellas, convierta aproximadamente a litros.",
     "relevant": "${compran_refresco}='si' or ${compran_refresco}='aveces'",
     "constraint": ". >= 0",
     "constraintMsg": "No puede ser negativo."
    },
    {
     "name": "comida_fuera",
     "type": "select_one",
     "label": "¿Consumen comida preparada fuera de casa?",
     "required": true,
     "list": "frecuencia"
    },
    {
     "name": "dias_comida_preparada",
     "type": "integer",
     "label": "¿Cuántos días a la semana comen comida preparada?",
     "required": true,
     "relevant": "${comida_fuera}='si' or ${comida_fuera}='aveces'",
     "constraint": ". >= 0 and . <= 7",
     "constraintMsg": "Ingrese un número de 0 a 7."
    },
    {
     "name": "origen_tortillas",
     "type": "select_one",
     "label": "¿Las tortillas son hechas en casa o compradas?",
     "required": true,
     "list": "tortillas"
    },
    {
     "name": "kg_tortilla",
     "type": "decimal",
     "label": "¿Cuántos kilos de tortilla consume al día el hogar?",
     "relevant": "${origen_tortillas}!='no_consume' and ${origen_tortillas}!='no_sabe'",
     "constraint": ". >= 0",
     "constraintMsg": "No puede ser negativo."
    },
    {
     "name": "tierra_animales",
     "type": "select_one",
     "label": "¿Tienen tierra que trabajen o animales de corral?",
     "required": true,
     "list": "sino_ns"
    },
    {
     "name": "autoconsumo",
     "type": "select_one",
     "label": "¿Qué proporción del año se alimentan de productos propios?",
     "required": true,
     "relevant": "${tierra_animales}='si'",
     "list": "proporcion"
    },
    {
     "name": "obs_alimentacion",
     "type": "text",
     "label": "Observaciones sobre alimentación",
     "multiline": true
    }
   ],
   "relevant": "${consiente}='si'"
  },
  {
   "id": "paso4",
   "titulo": "Integrantes del hogar",
   "items": [
    {
     "name": "numero_integrantes",
     "type": "integer",
     "label": "Número total de integrantes del hogar",
     "required": true,
     "relevant": "${consiente}='si'",
     "constraint": ". >= 1",
     "constraintMsg": "Debe ser al menos 1."
    },
    {
     "name": "integrantes",
     "type": "repeat",
     "label": "Integrante del hogar",
     "hint": "Agregue un bloque por cada integrante.",
     "required": true,
     "relevant": "${consiente}='si'",
     "items": [
      {
       "name": "integrante_num",
       "type": "calculate",
       "label": "",
       "calc": "position(..)"
      },
      {
       "name": "nombre_iniciales",
       "type": "text",
       "label": "Nombre o iniciales"
      },
      {
       "name": "parentesco",
       "type": "select_one",
       "label": "Relación con la persona jefa del hogar",
       "required": true,
       "list": "parentesco"
      },
      {
       "name": "sexo",
       "type": "select_one",
       "label": "Sexo registrado",
       "required": true,
       "list": "sexo"
      },
      {
       "name": "edad",
       "type": "integer",
       "label": "Edad en años cumplidos",
       "required": true,
       "constraint": ". >= 0 and . <= 120",
       "constraintMsg": "Ingrese una edad entre 0 y 120."
      },
      {
       "name": "escolaridad",
       "type": "select_one",
       "label": "Escolaridad",
       "required": true,
       "list": "escolaridad"
      },
      {
       "name": "ocupacion",
       "type": "text",
       "label": "Ocupación principal"
      },
      {
       "name": "dm2_dx",
       "type": "select_one",
       "label": "¿Tiene diagnóstico previo de diabetes mellitus tipo 2?",
       "required": true,
       "list": "respuesta_salud"
      },
      {
       "name": "hta_dx",
       "type": "select_one",
       "label": "¿Tiene diagnóstico previo de hipertensión arterial?",
       "required": true,
       "list": "respuesta_salud"
      },
      {
       "name": "otro_cronico",
       "type": "select_one",
       "label": "¿Tiene otro padecimiento crónico?",
       "required": true,
       "list": "sino_ns"
      },
      {
       "name": "otro_cronico_espec",
       "type": "text",
       "label": "Especifique otro padecimiento crónico",
       "relevant": "${otro_cronico}='si'"
      },
      {
       "name": "tratamiento_regular",
       "type": "select_one",
       "label": "¿Sigue regularmente el tratamiento indicado?",
       "required": true,
       "relevant": "${dm2_dx}='si' or ${hta_dx}='si' or ${otro_cronico}='si'",
       "list": "tratamiento"
      },
      {
       "name": "glucosa_ultimo_ano",
       "type": "select_one",
       "label": "¿Le han medido glucosa en el último año?",
       "required": true,
       "list": "sino_ns"
      },
      {
       "name": "pa_ultimo_ano",
       "type": "select_one",
       "label": "¿Le han medido la presión arterial en el último año?",
       "required": true,
       "list": "sino_ns"
      },
      {
       "name": "mod_dm2",
       "type": "group",
       "label": "Tamiz orientativo de DM2",
       "hint": "No constituye diagnóstico.",
       "relevant": "${dm2_dx}!='si' and ${edad}>=40",
       "items": [
        {
         "name": "dm2_sed",
         "type": "select_one",
         "label": "En las últimas semanas, ¿ha tenido mucha sed?",
         "required": true,
         "list": "sino_ns"
        },
        {
         "name": "dm2_orina",
         "type": "select_one",
         "label": "¿Ha orinado con mucha frecuencia o se levanta varias veces por la noche?",
         "required": true,
         "list": "sino_ns"
        },
        {
         "name": "dm2_peso",
         "type": "select_one",
         "label": "¿Ha bajado de peso sin proponérselo?",
         "required": true,
         "list": "sino_ns"
        },
        {
         "name": "dm2_cansancio",
         "type": "select_one",
         "label": "¿Se siente muy cansado(a) casi todos los días?",
         "required": true,
         "list": "sino_ns"
        },
        {
         "name": "dm2_vision",
         "type": "select_one",
         "label": "¿Ve borroso con frecuencia?",
         "required": true,
         "list": "sino_ns"
        },
        {
         "name": "dm2_heridas",
         "type": "select_one",
         "label": "¿Las heridas tardan mucho en cerrar?",
         "required": true,
         "list": "sino_ns"
        },
        {
         "name": "dm2_infecciones",
         "type": "select_one",
         "label": "¿Ha tenido infecciones frecuentes de piel, vías urinarias o por hongos?",
         "required": true,
         "list": "sino_ns"
        },
        {
         "name": "dm2_prueba_recomendada",
         "type": "select_one",
         "label": "¿Algún profesional le ha recomendado hacerse una prueba de glucosa?",
         "required": true,
         "list": "sino_ns"
        },
        {
         "name": "dm2_sintomas_num",
         "type": "calculate",
         "label": "",
         "calc": "if(${dm2_sed}='si',1,0)+if(${dm2_orina}='si',1,0)+if(${dm2_peso}='si',1,0)+if(${dm2_cansancio}='si',1,0)+if(${dm2_vision}='si',1,0)+if(${dm2_heridas}='si',1,0)+if(${dm2_infecciones}='si',1,0)"
        },
        {
         "name": "orientar_glucosa",
         "type": "select_one",
         "label": "¿Se recomienda orientar a valoración de glucosa?",
         "hint": "Considere síntomas, falta de medición previa y preocupación de la persona. No use el conteo como diagnóstico.",
         "required": true,
         "list": "sino"
        }
       ]
      },
      {
       "name": "mod_hta",
       "type": "group",
       "label": "Hipertensión arterial",
       "hint": "La hipertensión suele no producir síntomas; el tamiz se basa en antecedentes y medición.",
       "relevant": "${edad}>=18",
       "items": [
        {
         "name": "pa_alguna_vez",
         "type": "select_one",
         "label": "¿Alguna vez le han medido la presión arterial?",
         "required": true,
         "list": "sino_ns"
        },
        {
         "name": "pa_dijeron_alta",
         "type": "select_one",
         "label": "¿Le han dicho en una clínica o consulta que tenía la presión alta?",
         "required": true,
         "list": "sino_ns"
        },
        {
         "name": "toma_pa",
         "type": "select_one",
         "label": "¿Actualmente toma medicamento indicado para la presión?",
         "required": true,
         "relevant": "${hta_dx}='si' or ${pa_dijeron_alta}='si'",
         "list": "sino_na_ns"
        },
        {
         "name": "dejo_pa",
         "type": "select_one",
         "label": "En el último mes, ¿dejó de tomarlo por alguna razón?",
         "required": true,
         "relevant": "${toma_pa}='si'",
         "list": "sino_na_ns"
        },
        {
         "name": "razon_dejo_pa",
         "type": "text",
         "label": "Razón principal por la que dejó de tomarlo",
         "relevant": "${dejo_pa}='si'"
        },
        {
         "name": "tiene_medicion_pa",
         "type": "select_one",
         "label": "¿Tiene una medición reciente de presión arterial?",
         "required": true,
         "list": "sino"
        },
        {
         "name": "pa_sistolica",
         "type": "integer",
         "label": "Presión sistólica registrada",
         "relevant": "${tiene_medicion_pa}='si'",
         "constraint": ". >= 50 and . <= 300",
         "constraintMsg": "Revise el valor."
        },
        {
         "name": "pa_diastolica",
         "type": "integer",
         "label": "Presión diastólica registrada",
         "relevant": "${tiene_medicion_pa}='si'",
         "constraint": ". >= 30 and . <= 200",
         "constraintMsg": "Revise el valor."
        },
        {
         "name": "fecha_medicion_pa",
         "type": "date",
         "label": "Fecha de la medición",
         "relevant": "${tiene_medicion_pa}='si'"
        },
        {
         "name": "signos_urgencia",
         "type": "select_multiple",
         "label": "¿Presenta ahora alguno de estos signos de urgencia?",
         "hint": "Dolor de pecho, dificultad intensa para respirar, debilidad repentina de un lado, alteración súbita del habla o desmayo.",
         "list": "urgencia"
        },
        {
         "name": "referencia_urgente_general",
         "type": "calculate",
         "label": "",
         "calc": "if(count-selected(${signos_urgencia})>0,1,0)"
        },
        {
         "name": "nota_urgencia_general",
         "type": "note",
         "label": "Suspenda el tamiz y active el protocolo local de referencia inmediata.",
         "relevant": "${referencia_urgente_general}=1"
        }
       ]
      },
      {
       "name": "embarazo_actual",
       "type": "select_one",
       "label": "¿Está embarazada actualmente?",
       "required": true,
       "relevant": "${sexo}='mujer' and ${edad}>=10 and ${edad}<=55",
       "list": "embarazo_estado"
      },
      {
       "name": "embarazos_previos",
       "type": "select_one",
       "label": "¿Ha tenido embarazos previamente?",
       "required": true,
       "relevant": "${sexo}='mujer' and ${edad}>=10",
       "list": "sino_ns"
      },
      {
       "name": "mod_embarazo",
       "type": "group",
       "label": "Embarazo, diabetes gestacional y trastornos hipertensivos",
       "relevant": "${sexo}='mujer' and (${embarazo_actual}='si' or ${embarazos_previos}='si')",
       "items": [
        {
         "name": "semanas_gestacion",
         "type": "integer",
         "label": "Semanas aproximadas de embarazo",
         "required": true,
         "relevant": "${embarazo_actual}='si'",
         "constraint": ". >= 1 and . <= 45",
         "constraintMsg": "Revise las semanas de gestación."
        },
        {
         "name": "control_prenatal",
         "type": "select_one",
         "label": "¿Ha iniciado control prenatal?",
         "required": true,
         "relevant": "${embarazo_actual}='si'",
         "list": "sino_ns"
        },
        {
         "name": "pa_embarazo",
         "type": "select_one",
         "label": "¿Le han medido la presión durante este embarazo?",
         "required": true,
         "relevant": "${embarazo_actual}='si'",
         "list": "sino_ns"
        },
        {
         "name": "glucosa_embarazo",
         "type": "select_one",
         "label": "¿Le han realizado alguna prueba de glucosa durante este embarazo?",
         "required": true,
         "relevant": "${embarazo_actual}='si'",
         "list": "sino_ns"
        },
        {
         "name": "prueba_dg_24_28",
         "type": "select_one",
         "label": "¿Le ofrecieron o realizaron una prueba para diabetes gestacional entre las semanas 24 y 28?",
         "required": true,
         "relevant": "${embarazo_actual}='si' and ${semanas_gestacion}>=24 and ${semanas_gestacion}<=28",
         "list": "sino_na_ns"
        },
        {
         "name": "dg_actual",
         "type": "select_one",
         "label": "¿Le han diagnosticado diabetes gestacional en este embarazo?",
         "required": true,
         "relevant": "${embarazo_actual}='si'",
         "list": "respuesta_salud"
        },
        {
         "name": "hta_gest_actual",
         "type": "select_one",
         "label": "¿Le han diagnosticado hipertensión gestacional o preeclampsia?",
         "required": true,
         "relevant": "${embarazo_actual}='si'",
         "list": "respuesta_salud"
        },
        {
         "name": "dg_previa",
         "type": "select_one",
         "label": "En embarazos previos, ¿tuvo diabetes gestacional?",
         "required": true,
         "relevant": "${embarazos_previos}='si'",
         "list": "sino_na_ns"
        },
        {
         "name": "preeclampsia_previa",
         "type": "select_one",
         "label": "En embarazos previos, ¿tuvo preeclampsia, eclampsia o presión alta?",
         "required": true,
         "relevant": "${embarazos_previos}='si'",
         "list": "sino_na_ns"
        },
        {
         "name": "bebe_4kg",
         "type": "select_one",
         "label": "¿Ha tenido un bebé de 4 kg o más?",
         "required": true,
         "relevant": "${embarazos_previos}='si'",
         "list": "sino_na_ns"
        },
        {
         "name": "familia_diabetes",
         "type": "select_one",
         "label": "¿Su padre, madre o alguno de sus hermanos tiene diabetes?",
         "required": true,
         "list": "sino_ns"
        },
        {
         "name": "alarmas_obstetricas",
         "type": "select_multiple",
         "label": "¿Presenta ahora alguna señal de alarma obstétrica?",
         "hint": "Marque todas las que correspondan.",
         "relevant": "${embarazo_actual}='si'",
         "list": "alarma_obs"
        },
        {
         "name": "referencia_urgente_obst",
         "type": "calculate",
         "label": "",
         "calc": "if(count-selected(${alarmas_obstetricas})>0,1,0)"
        },
        {
         "name": "nota_urgencia_obst",
         "type": "note",
         "label": "Suspenda el tamiz y active el protocolo local de referencia inmediata.",
         "relevant": "${referencia_urgente_obst}=1"
        }
       ]
      },
      {
       "name": "obs_integrante",
       "type": "text",
       "label": "Observaciones del integrante",
       "multiline": true
      }
     ]
    }
   ]
  },
  {
   "id": "clasificacion",
   "titulo": "Clasificación preliminar y seguimiento",
   "items": [
    {
     "name": "hogar_dm2",
     "type": "select_one",
     "label": "¿Hay al menos una persona con DM2 diagnosticada?",
     "required": true,
     "list": "sino_ns"
    },
    {
     "name": "hogar_hta",
     "type": "select_one",
     "label": "¿Hay al menos una persona con HTA diagnosticada?",
     "required": true,
     "list": "sino_ns"
    },
    {
     "name": "hogar_dg",
     "type": "select_one",
     "label": "¿Hay antecedente o diagnóstico actual de diabetes gestacional?",
     "required": true,
     "list": "sino_ns"
    },
    {
     "name": "hogar_preeclampsia",
     "type": "select_one",
     "label": "¿Hay antecedente o diagnóstico de preeclampsia o hipertensión gestacional?",
     "required": true,
     "list": "sino_ns"
    },
    {
     "name": "orientacion_no_urgente",
     "type": "select_one",
     "label": "¿Alguna persona requiere orientación para valoración no urgente?",
     "required": true,
     "list": "sino"
    },
    {
     "name": "se_activo_urgencia",
     "type": "select_one",
     "label": "¿Se activó una referencia urgente?",
     "required": true,
     "list": "sino"
    },
    {
     "name": "prioridad",
     "type": "select_one",
     "label": "Prioridad para invitación posterior",
     "required": true,
     "list": "prioridad"
    },
    {
     "name": "tipo_invitacion",
     "type": "select_one",
     "label": "Tipo de invitación potencial",
     "required": true,
     "list": "invitacion"
    },
    {
     "name": "disponibilidad",
     "type": "select_one",
     "label": "Disponibilidad preliminar para visita posterior",
     "required": true,
     "list": "disponibilidad"
    },
    {
     "name": "momento_volver",
     "type": "select_one",
     "label": "Mejor momento para volver",
     "relevant": "${disponibilidad}!='no'",
     "list": "momento"
    },
    {
     "name": "observaciones_seguimiento",
     "type": "text",
     "label": "Observaciones de seguimiento",
     "multiline": true
    }
   ],
   "relevant": "${consiente}='si'"
  }
 ]
};
