(function () {
  const STORAGE_KEY = 'physioapp_language';
  const LEGACY_KEY = 'physioapp_settings_misc_state';

  const SUPPORTED = {
    english: 'en',
    spanish: 'es',
    french: 'fr'
  };

  const TRANSLATIONS = {
    english: {
      'settings.title': 'Settings',
      'settings.metaTitle': 'Settings | PhysioApp',
      'settings.subtitle': 'Manage your profile, notifications, preferences, and account security.',
      'settings.backToDashboard': 'Back to dashboard',
      'settings.logout': 'Log out',
      'settings.profile.title': 'Profile & Health Information',
      'settings.profile.username': 'Username',
      'settings.profile.ageOptional': 'Age (optional)',
      'settings.profile.gender': 'Gender',
      'settings.profile.gender.select': 'Select gender',
      'settings.profile.gender.male': 'Male',
      'settings.profile.gender.female': 'Female',
      'settings.profile.gender.nonBinary': 'Non-binary',
      'settings.profile.gender.preferNot': 'Prefer not to say',
      'settings.profile.gender.other': 'Other',
      'settings.profile.rehabLevel': 'Rehab level',
      'settings.profile.rehab.beginner': 'Beginner',
      'settings.profile.rehab.intermediate': 'Intermediate',
      'settings.profile.rehab.advanced': 'Advanced',
      'settings.profile.height': 'Height',
      'settings.profile.heightUnit': 'Height unit',
      'settings.profile.heightCm': 'Height (cm)',
      'settings.profile.heightFeet': 'Feet',
      'settings.profile.heightInches': 'Inches',
      'settings.profile.weight': 'Weight',
      'settings.profile.weightUnit': 'Weight unit',
      'settings.profile.weightValue': 'Weight value',
      'settings.profile.injuryFocus': 'Injury focus',
      'settings.profile.injury.select': 'Select injury focus',
      'settings.profile.injury.none': 'None',
      'settings.profile.injury.knee': 'Knee',
      'settings.profile.injury.shoulder': 'Shoulder',
      'settings.profile.injury.back': 'Back',
      'settings.profile.injury.neck': 'Neck',
      'settings.profile.injury.ankle': 'Ankle',
      'settings.profile.injury.hip': 'Hip',
      'settings.profile.injury.elbow': 'Elbow',
      'settings.profile.injury.wrist': 'Wrist',
      'settings.profile.injury.other': 'Other',
      'settings.profile.injuryOtherOptional': 'Other injury (optional)',
      'settings.profile.injuryOtherPlaceholder': 'Describe injury focus',
      'settings.profile.conditionFocus': 'Condition focus',
      'settings.profile.condition.select': 'Select condition focus',
      'settings.profile.condition.generalFitness': 'General Fitness',
      'settings.profile.condition.strengthBuilding': 'Strength Building',
      'settings.profile.condition.muscleGain': 'Muscle Gain',
      'settings.profile.condition.fatLoss': 'Fat Loss',
      'settings.profile.condition.rehab': 'Rehab',
      'settings.profile.condition.mobility': 'Mobility',
      'settings.profile.condition.endurance': 'Endurance',
      'settings.profile.condition.postSurgery': 'Post-Surgery Recovery',
      'settings.profile.condition.athleticPerformance': 'Athletic Performance',
      'settings.profile.save': 'Save profile settings',
      'settings.workout.title': 'Workout & Recovery Preferences',
      'settings.workout.durationLabel': 'Preferred workout duration',
      'settings.workout.duration.15': '15 minutes',
      'settings.workout.duration.20': '20 minutes',
      'settings.workout.duration.30': '30 minutes',
      'settings.workout.duration.45': '45 minutes',
      'settings.workout.duration.60': '60 minutes',
      'settings.workout.recoveryReminders': 'Recovery day reminders',
      'settings.workout.painFeedback': 'Pain feedback after workouts',
      'settings.workout.autoAdjust': 'Auto-adjust difficulty',
      'settings.workout.conservativeMode': 'Conservative progression mode',
      'settings.notifications.title': 'Notifications',
      'settings.notifications.workoutReminders': 'Workout reminders',
      'settings.notifications.restDayReminders': 'Rest day reminders',
      'settings.notifications.progressCheckIns': 'Progress check-ins',
      'settings.notifications.routineRecommendations': 'Routine recommendations',
      'settings.security.title': 'Security & Privacy',
      'settings.security.helper': 'Keep your account secure and review your account data whenever you need to.',
      'settings.security.changePassword': 'Change password',
      'settings.security.enable2fa': 'Enable Two-Factor Authentication',
      'settings.security.disable2fa': 'Disable Two-Factor Authentication',
      'settings.security.viewSessions': 'View active sessions',
      'settings.security.exportDelete': 'Export / delete data',
      'settings.security.currentPassword': 'Current password',
      'settings.security.newPassword': 'New password',
      'settings.security.confirmPassword': 'Confirm new password',
      'settings.security.updatePassword': 'Update password',
      'settings.security.disable2faConfirm': 'Disable two-factor authentication for this account?',
      'settings.security.viewSessionsFuture': 'Active session management will be available in a future update.',
      'settings.security.exportDeleteFuture': 'Data export and deletion tools will be available in a future update.',
      'settings.action.edit': 'Edit',
      'settings.action.action': 'Action',
      'settings.action.setup': 'Setup',
      'settings.action.open': 'Open',
      'settings.action.view': 'View',
      'settings.appPreferences.title': 'App Preferences',
      'settings.appPreferences.theme': 'Theme',
      'settings.appPreferences.language': 'Language',
      'settings.appPreferences.units': 'Units',
      'settings.theme.system': 'System',
      'settings.theme.light': 'Light',
      'settings.theme.dark': 'Dark',
      'settings.language.english': 'English',
      'settings.language.spanish': 'Spanish',
      'settings.language.french': 'French',
      'settings.units.metric': 'Metric',
      'settings.units.imperial': 'Imperial',
      'settings.support.title': 'Support & About',
      'settings.support.helpFaqs': 'Help & FAQs',
      'settings.support.contactSupport': 'Contact support',
      'settings.support.aboutPhysioApp': 'About PhysioApp',
      'settings.support.terms': 'Terms of Service',
      'settings.support.privacy': 'Privacy Policy',
      'settings.support.disclaimer': 'This app does not replace medical advice.',
      'settings.support.fallback': 'Support page',
      'settings.support.notConnected': 'is not connected yet.',
      'settings.status.saving': 'Saving...',
      'settings.status.saved': 'Changes have been saved.',
      'settings.status.failedSavePreference': 'Failed to save preference.',
      'settings.status.loadingWorkoutPrefs': 'Loading your preferences...',
      'settings.status.failedLoadWorkoutPrefs': 'Could not load workout preferences.',
      'settings.status.failedSaveNotificationPreference': 'Failed to save notification preference.',
      'settings.status.loadingNotificationPrefs': 'Loading notification preferences...',
      'settings.status.failedLoadNotificationPrefs': 'Could not load notification preferences.',
      'settings.status.languageChanged': 'Language changed to',
      'common.nav.dashboard': 'Dashboard',
      'common.submit': 'Submit',
      'common.completed': 'Completed',
      'category.title': 'What would you like to do today?',
      'category.workoutType': 'Workout Type:',
      'where.title': 'Where Are You Training?',
      'muscle.title': 'Focus Area',
      'exercises.selectTitle': 'Select Exercises',
      'exercises.yourRoutine': 'Your Routine:',
      'exercises.showRoutine': 'Show Routine',
      'exercises.saveNewSearch': 'Save & New Search',
      'exercises.resetNewSearch': 'Reset & New Search',
      'favourites.title': 'Your Favourite Exercises',
      'favourites.addToRoutine': 'Add to Routine:',
      'favourites.removeFromFavourites': 'Remove from Favourites:',
      'favourites.saveChanges': 'Save Changes',
      'routine.title': 'Your Exercise Routine',
      'routine.restart': 'Restart Routine',
      'routine.newSearch': 'New Search',
      'routine.showFavourites': 'Show Favourites',
      'routine.allCompleted': 'All exercises in your routine are completed!',
      'routine.painCheckin.title': 'Post-workout pain check-in',
      'routine.painCheckin.submit': 'Submit pain feedback',
      'routine.painCheckin.disabled': 'Pain check-in is disabled in your settings. Workout completed successfully.',
      'goals.title': 'Your Goals',
      'goals.saved': 'Your saved goals',
      'goals.focus': 'What do you want to focus on?',
      'goals.growth': 'How much growth?',
      'goals.notesOptional': 'Notes (optional)',
      'goals.saveBtn': 'Save my goals',
      'about.title': 'About PhysioApp',
      'about.subtitle': 'Helping you stay active and healthy, whether at home or in the gym!',
      'about.homeTitle': 'Home Workouts',
      'about.homeBody': 'Quick exercises you can do with no equipment.',
      'about.gymTitle': 'Gym Workouts',
      'about.gymBody': 'Routines that use standard gym equipment.',
      'about.mobilityTitle': 'Stretching & Mobility',
      'about.mobilityBody': 'Improve flexibility and prevent injury.',
      'info.title': 'Welcome to PhysioApp',
      'info.subtitle': 'Before using routines or exercises, follow these steps:',
      'info.step1Label': 'Step 1:',
      'info.step1Body': 'Go to the Dashboard.',
      'info.step2Label': 'Step 2:',
      'info.step2Body': 'Click Start New Workout.',
      'info.step3Label': 'Step 3:',
      'info.step3Body': 'Choose your location (Home or Gym).',
      'info.step4Label': 'Step 4:',
      'info.step4Body': 'Select category and muscle group to build your routine.',
      'info.goToDashboard': 'Go to Dashboard',
      'twofa.setup.eyebrow': 'Security Upgrade',
      'twofa.setup.title': 'Set Up Two-Factor Authentication',
      'twofa.setup.enable': 'Enable 2FA',
      'twofa.setup.cancel': 'Cancel and return to settings',
      'twofa.verify.eyebrow': 'Two-Factor Check',
      'twofa.verify.title': 'Verify Sign-In',
      'twofa.verify.helper': 'Open your authenticator app and enter the current code.',
      'twofa.verify.codeLabel': '6-digit code',
      'twofa.verify.button': 'Verify',
      'twofa.verify.back': 'Back to login',
      'auth.goHome': 'Go to homepage',
      'auth.username': 'Username',
      'auth.password': 'Password',
      'auth.reset': 'Reset',
      'auth.here': 'here',
      'auth.login.title': 'Sign in to your account',
      'auth.login.submit': 'Sign-In',
      'auth.login.noAccount': "Don't have an account? Click",
      'auth.login.toSignUp': 'to sign up',
      'auth.register.title': 'Make your account',
      'auth.register.email': 'Email Address',
      'auth.register.retypePassword': 'Re-type Password',
      'auth.register.terms': 'I agree to the terms and conditions',
      'auth.register.submit': 'Sign Up',
      'auth.register.haveAccount': 'Have an account? Click',
      'auth.register.toSignIn': 'to sign in',
      'dashboard.nav.exercises': 'Exercises',
      'dashboard.nav.routines': 'Routines',
      'dashboard.nav.favourites': 'Favourites',
      'dashboard.nav.about': 'About Us',
      'dashboard.nav.howto': 'How To Use',
      'dashboard.nav.settings': 'Settings',
      'dashboard.nav.enable2fa': 'Enable 2FA',
      'dashboard.nav.disable2fa': 'Disable 2FA',
      'dashboard.title': 'Your Progress',
      'dashboard.stat.nextBreak': 'Next Break Day',
      'dashboard.stat.streak': 'Current Streak',
      'dashboard.stat.lastWorkout': 'Last Workout',
      'dashboard.cta.startWorkout': 'Start New Workout',
      'dashboard.cta.goals': 'Your Goals',
      'dashboard.logout': 'Logout'
    },
    spanish: {
      'settings.title': 'Configuracion',
      'settings.metaTitle': 'Configuracion | PhysioApp',
      'settings.subtitle': 'Administra tu perfil, notificaciones, preferencias y seguridad de tu cuenta.',
      'settings.backToDashboard': 'Volver al panel',
      'settings.logout': 'Cerrar sesion',
      'settings.profile.title': 'Perfil e informacion de salud',
      'settings.profile.username': 'Nombre de usuario',
      'settings.profile.ageOptional': 'Edad (opcional)',
      'settings.profile.gender': 'Genero',
      'settings.profile.gender.select': 'Selecciona genero',
      'settings.profile.gender.male': 'Masculino',
      'settings.profile.gender.female': 'Femenino',
      'settings.profile.gender.nonBinary': 'No binario',
      'settings.profile.gender.preferNot': 'Prefiero no decirlo',
      'settings.profile.gender.other': 'Otro',
      'settings.profile.rehabLevel': 'Nivel de rehabilitacion',
      'settings.profile.rehab.beginner': 'Principiante',
      'settings.profile.rehab.intermediate': 'Intermedio',
      'settings.profile.rehab.advanced': 'Avanzado',
      'settings.profile.height': 'Altura',
      'settings.profile.heightUnit': 'Unidad de altura',
      'settings.profile.heightCm': 'Altura (cm)',
      'settings.profile.heightFeet': 'Pies',
      'settings.profile.heightInches': 'Pulgadas',
      'settings.profile.weight': 'Peso',
      'settings.profile.weightUnit': 'Unidad de peso',
      'settings.profile.weightValue': 'Valor de peso',
      'settings.profile.injuryFocus': 'Enfoque de lesion',
      'settings.profile.injury.select': 'Selecciona enfoque de lesion',
      'settings.profile.injury.none': 'Ninguno',
      'settings.profile.injury.knee': 'Rodilla',
      'settings.profile.injury.shoulder': 'Hombro',
      'settings.profile.injury.back': 'Espalda',
      'settings.profile.injury.neck': 'Cuello',
      'settings.profile.injury.ankle': 'Tobillo',
      'settings.profile.injury.hip': 'Cadera',
      'settings.profile.injury.elbow': 'Codo',
      'settings.profile.injury.wrist': 'Muneca',
      'settings.profile.injury.other': 'Otro',
      'settings.profile.injuryOtherOptional': 'Otra lesion (opcional)',
      'settings.profile.injuryOtherPlaceholder': 'Describe el enfoque de lesion',
      'settings.profile.conditionFocus': 'Enfoque de condicion',
      'settings.profile.condition.select': 'Selecciona enfoque de condicion',
      'settings.profile.condition.generalFitness': 'Estado fisico general',
      'settings.profile.condition.strengthBuilding': 'Desarrollo de fuerza',
      'settings.profile.condition.muscleGain': 'Ganancia muscular',
      'settings.profile.condition.fatLoss': 'Perdida de grasa',
      'settings.profile.condition.rehab': 'Rehabilitacion',
      'settings.profile.condition.mobility': 'Movilidad',
      'settings.profile.condition.endurance': 'Resistencia',
      'settings.profile.condition.postSurgery': 'Recuperacion postoperatoria',
      'settings.profile.condition.athleticPerformance': 'Rendimiento atletico',
      'settings.profile.save': 'Guardar ajustes del perfil',
      'settings.workout.title': 'Preferencias de entrenamiento y recuperacion',
      'settings.workout.durationLabel': 'Duracion preferida del entrenamiento',
      'settings.workout.duration.15': '15 minutos',
      'settings.workout.duration.20': '20 minutos',
      'settings.workout.duration.30': '30 minutos',
      'settings.workout.duration.45': '45 minutos',
      'settings.workout.duration.60': '60 minutos',
      'settings.workout.recoveryReminders': 'Recordatorios de recuperacion',
      'settings.workout.painFeedback': 'Retroalimentacion de dolor despues de entrenar',
      'settings.workout.autoAdjust': 'Ajuste automatico de dificultad',
      'settings.workout.conservativeMode': 'Modo de progresion conservador',
      'settings.notifications.title': 'Notificaciones',
      'settings.notifications.workoutReminders': 'Recordatorios de entrenamiento',
      'settings.notifications.restDayReminders': 'Recordatorios de descanso',
      'settings.notifications.progressCheckIns': 'Controles de progreso',
      'settings.notifications.routineRecommendations': 'Recomendaciones de rutina',
      'settings.security.title': 'Seguridad y privacidad',
      'settings.security.helper': 'Manten tu cuenta segura y revisa tus datos cuando lo necesites.',
      'settings.security.changePassword': 'Cambiar contrasena',
      'settings.security.enable2fa': 'Activar autenticacion de dos factores',
      'settings.security.disable2fa': 'Desactivar autenticacion de dos factores',
      'settings.security.viewSessions': 'Ver sesiones activas',
      'settings.security.exportDelete': 'Exportar / eliminar datos',
      'settings.security.currentPassword': 'Contrasena actual',
      'settings.security.newPassword': 'Nueva contrasena',
      'settings.security.confirmPassword': 'Confirmar nueva contrasena',
      'settings.security.updatePassword': 'Actualizar contrasena',
      'settings.security.disable2faConfirm': 'Desactivar autenticacion de dos factores para esta cuenta?',
      'settings.security.viewSessionsFuture': 'La gestion de sesiones activas estara disponible en una futura actualizacion.',
      'settings.security.exportDeleteFuture': 'Las herramientas de exportacion y eliminacion de datos estaran disponibles en una futura actualizacion.',
      'settings.action.edit': 'Editar',
      'settings.action.action': 'Accion',
      'settings.action.setup': 'Configurar',
      'settings.action.open': 'Abrir',
      'settings.action.view': 'Ver',
      'settings.appPreferences.title': 'Preferencias de la app',
      'settings.appPreferences.theme': 'Tema',
      'settings.appPreferences.language': 'Idioma',
      'settings.appPreferences.units': 'Unidades',
      'settings.theme.system': 'Sistema',
      'settings.theme.light': 'Claro',
      'settings.theme.dark': 'Oscuro',
      'settings.language.english': 'Ingles',
      'settings.language.spanish': 'Espanol',
      'settings.language.french': 'Frances',
      'settings.units.metric': 'Metrico',
      'settings.units.imperial': 'Imperial',
      'settings.support.title': 'Soporte e informacion',
      'settings.support.helpFaqs': 'Ayuda y preguntas frecuentes',
      'settings.support.contactSupport': 'Contactar soporte',
      'settings.support.aboutPhysioApp': 'Acerca de PhysioApp',
      'settings.support.terms': 'Terminos del servicio',
      'settings.support.privacy': 'Politica de privacidad',
      'settings.support.disclaimer': 'Esta aplicacion no reemplaza el consejo medico.',
      'settings.support.fallback': 'Pagina de soporte',
      'settings.support.notConnected': 'todavia no esta conectado.',
      'settings.status.saving': 'Guardando...',
      'settings.status.saved': 'Los cambios se guardaron.',
      'settings.status.failedSavePreference': 'No se pudo guardar la preferencia.',
      'settings.status.loadingWorkoutPrefs': 'Cargando tus preferencias...',
      'settings.status.failedLoadWorkoutPrefs': 'No se pudieron cargar las preferencias de entrenamiento.',
      'settings.status.failedSaveNotificationPreference': 'No se pudo guardar la preferencia de notificaciones.',
      'settings.status.loadingNotificationPrefs': 'Cargando preferencias de notificaciones...',
      'settings.status.failedLoadNotificationPrefs': 'No se pudieron cargar las preferencias de notificaciones.',
      'settings.status.languageChanged': 'Idioma cambiado a',
      'common.nav.dashboard': 'Panel',
      'common.submit': 'Enviar',
      'common.completed': 'Completado',
      'category.title': 'Que te gustaria hacer hoy?',
      'category.workoutType': 'Tipo de entrenamiento:',
      'where.title': 'Donde entrenas?',
      'muscle.title': 'Area de enfoque',
      'exercises.selectTitle': 'Seleccionar ejercicios',
      'exercises.yourRoutine': 'Tu rutina:',
      'exercises.showRoutine': 'Mostrar rutina',
      'exercises.saveNewSearch': 'Guardar y nueva busqueda',
      'exercises.resetNewSearch': 'Reiniciar y nueva busqueda',
      'favourites.title': 'Tus ejercicios favoritos',
      'favourites.addToRoutine': 'Agregar a rutina:',
      'favourites.removeFromFavourites': 'Quitar de favoritos:',
      'favourites.saveChanges': 'Guardar cambios',
      'routine.title': 'Tu rutina de ejercicios',
      'routine.restart': 'Reiniciar rutina',
      'routine.newSearch': 'Nueva busqueda',
      'routine.showFavourites': 'Mostrar favoritos',
      'routine.allCompleted': 'Todos los ejercicios de tu rutina estan completados!',
      'routine.painCheckin.title': 'Control de dolor post-entrenamiento',
      'routine.painCheckin.submit': 'Enviar dolor',
      'routine.painCheckin.disabled': 'El control de dolor esta desactivado en ajustes. Entrenamiento completado.',
      'goals.title': 'Tus metas',
      'goals.saved': 'Tus metas guardadas',
      'goals.focus': 'En que quieres enfocarte?',
      'goals.growth': 'Cuanto crecimiento?',
      'goals.notesOptional': 'Notas (opcional)',
      'goals.saveBtn': 'Guardar mis metas',
      'about.title': 'Acerca de PhysioApp',
      'about.subtitle': 'Te ayudamos a mantenerte activo y saludable, en casa o en el gimnasio.',
      'about.homeTitle': 'Entrenamientos en casa',
      'about.homeBody': 'Ejercicios rapidos sin equipo.',
      'about.gymTitle': 'Entrenamientos de gimnasio',
      'about.gymBody': 'Rutinas con equipo estandar de gimnasio.',
      'about.mobilityTitle': 'Estiramiento y movilidad',
      'about.mobilityBody': 'Mejora flexibilidad y previene lesiones.',
      'info.title': 'Bienvenido a PhysioApp',
      'info.subtitle': 'Antes de usar rutinas o ejercicios, sigue estos pasos:',
      'info.step1Label': 'Paso 1:',
      'info.step1Body': 'Ir al panel.',
      'info.step2Label': 'Paso 2:',
      'info.step2Body': 'Haz clic en Comenzar entrenamiento.',
      'info.step3Label': 'Paso 3:',
      'info.step3Body': 'Elige ubicacion (Casa o Gimnasio).',
      'info.step4Label': 'Paso 4:',
      'info.step4Body': 'Selecciona categoria y grupo muscular para crear tu rutina.',
      'info.goToDashboard': 'Ir al panel',
      'twofa.setup.eyebrow': 'Mejora de seguridad',
      'twofa.setup.title': 'Configurar autenticacion de dos factores',
      'twofa.setup.enable': 'Activar 2FA',
      'twofa.setup.cancel': 'Cancelar y volver a ajustes',
      'twofa.verify.eyebrow': 'Verificacion de dos factores',
      'twofa.verify.title': 'Verificar inicio de sesion',
      'twofa.verify.helper': 'Abre tu app autenticadora e ingresa el codigo actual.',
      'twofa.verify.codeLabel': 'Codigo de 6 digitos',
      'twofa.verify.button': 'Verificar',
      'twofa.verify.back': 'Volver a inicio de sesion',
      'auth.goHome': 'Ir a inicio',
      'auth.username': 'Nombre de usuario',
      'auth.password': 'Contrasena',
      'auth.reset': 'Reiniciar',
      'auth.here': 'aqui',
      'auth.login.title': 'Inicia sesion en tu cuenta',
      'auth.login.submit': 'Iniciar sesion',
      'auth.login.noAccount': 'No tienes cuenta? Haz clic',
      'auth.login.toSignUp': 'para registrarte',
      'auth.register.title': 'Crea tu cuenta',
      'auth.register.email': 'Correo electronico',
      'auth.register.retypePassword': 'Repetir contrasena',
      'auth.register.terms': 'Acepto los terminos y condiciones',
      'auth.register.submit': 'Registrarse',
      'auth.register.haveAccount': 'Tienes cuenta? Haz clic',
      'auth.register.toSignIn': 'para iniciar sesion',
      'dashboard.nav.exercises': 'Ejercicios',
      'dashboard.nav.routines': 'Rutinas',
      'dashboard.nav.favourites': 'Favoritos',
      'dashboard.nav.about': 'Sobre nosotros',
      'dashboard.nav.howto': 'Como usar',
      'dashboard.nav.settings': 'Configuracion',
      'dashboard.nav.enable2fa': 'Activar 2FA',
      'dashboard.nav.disable2fa': 'Desactivar 2FA',
      'dashboard.title': 'Tu progreso',
      'dashboard.stat.nextBreak': 'Proximo dia de descanso',
      'dashboard.stat.streak': 'Racha actual',
      'dashboard.stat.lastWorkout': 'Ultimo entrenamiento',
      'dashboard.cta.startWorkout': 'Comenzar entrenamiento',
      'dashboard.cta.goals': 'Tus metas',
      'dashboard.logout': 'Cerrar sesion'
    },
    french: {
      'settings.title': 'Parametres',
      'settings.metaTitle': 'Parametres | PhysioApp',
      'settings.subtitle': 'Gerez votre profil, vos notifications, vos preferences et la securite de votre compte.',
      'settings.backToDashboard': 'Retour au tableau de bord',
      'settings.logout': 'Se deconnecter',
      'settings.profile.title': 'Profil et informations de sante',
      'settings.profile.username': "Nom d'utilisateur",
      'settings.profile.ageOptional': 'Age (optionnel)',
      'settings.profile.gender': 'Genre',
      'settings.profile.gender.select': 'Selectionnez le genre',
      'settings.profile.gender.male': 'Homme',
      'settings.profile.gender.female': 'Femme',
      'settings.profile.gender.nonBinary': 'Non binaire',
      'settings.profile.gender.preferNot': 'Je prefere ne pas le dire',
      'settings.profile.gender.other': 'Autre',
      'settings.profile.rehabLevel': 'Niveau de reeducation',
      'settings.profile.rehab.beginner': 'Debutant',
      'settings.profile.rehab.intermediate': 'Intermediaire',
      'settings.profile.rehab.advanced': 'Avance',
      'settings.profile.height': 'Taille',
      'settings.profile.heightUnit': 'Unite de taille',
      'settings.profile.heightCm': 'Taille (cm)',
      'settings.profile.heightFeet': 'Pieds',
      'settings.profile.heightInches': 'Pouces',
      'settings.profile.weight': 'Poids',
      'settings.profile.weightUnit': 'Unite de poids',
      'settings.profile.weightValue': 'Valeur du poids',
      'settings.profile.injuryFocus': 'Zone de blessure',
      'settings.profile.injury.select': 'Selectionnez la zone de blessure',
      'settings.profile.injury.none': 'Aucune',
      'settings.profile.injury.knee': 'Genou',
      'settings.profile.injury.shoulder': 'Epaule',
      'settings.profile.injury.back': 'Dos',
      'settings.profile.injury.neck': 'Cou',
      'settings.profile.injury.ankle': 'Cheville',
      'settings.profile.injury.hip': 'Hanche',
      'settings.profile.injury.elbow': 'Coude',
      'settings.profile.injury.wrist': 'Poignet',
      'settings.profile.injury.other': 'Autre',
      'settings.profile.injuryOtherOptional': 'Autre blessure (optionnel)',
      'settings.profile.injuryOtherPlaceholder': 'Decrivez la zone de blessure',
      'settings.profile.conditionFocus': 'Objectif de condition',
      'settings.profile.condition.select': 'Selectionnez un objectif',
      'settings.profile.condition.generalFitness': 'Condition generale',
      'settings.profile.condition.strengthBuilding': 'Developpement de la force',
      'settings.profile.condition.muscleGain': 'Prise de muscle',
      'settings.profile.condition.fatLoss': 'Perte de graisse',
      'settings.profile.condition.rehab': 'Reeducation',
      'settings.profile.condition.mobility': 'Mobilite',
      'settings.profile.condition.endurance': 'Endurance',
      'settings.profile.condition.postSurgery': 'Recuperation post-operatoire',
      'settings.profile.condition.athleticPerformance': 'Performance sportive',
      'settings.profile.save': 'Enregistrer les parametres du profil',
      'settings.workout.title': 'Preferences entrainement et recuperation',
      'settings.workout.durationLabel': "Duree d'entrainement preferee",
      'settings.workout.duration.15': '15 minutes',
      'settings.workout.duration.20': '20 minutes',
      'settings.workout.duration.30': '30 minutes',
      'settings.workout.duration.45': '45 minutes',
      'settings.workout.duration.60': '60 minutes',
      'settings.workout.recoveryReminders': 'Rappels de recuperation',
      'settings.workout.painFeedback': 'Retour sur la douleur apres entrainement',
      'settings.workout.autoAdjust': 'Ajustement automatique de la difficulte',
      'settings.workout.conservativeMode': 'Mode de progression conservateur',
      'settings.notifications.title': 'Notifications',
      'settings.notifications.workoutReminders': "Rappels d'entrainement",
      'settings.notifications.restDayReminders': 'Rappels de jour de repos',
      'settings.notifications.progressCheckIns': 'Bilans de progression',
      'settings.notifications.routineRecommendations': 'Recommandations de routine',
      'settings.security.title': 'Securite et confidentialite',
      'settings.security.helper': 'Gardez votre compte securise et consultez vos donnees quand vous voulez.',
      'settings.security.changePassword': 'Changer le mot de passe',
      'settings.security.enable2fa': "Activer l'authentification a deux facteurs",
      'settings.security.disable2fa': "Desactiver l'authentification a deux facteurs",
      'settings.security.viewSessions': 'Voir les sessions actives',
      'settings.security.exportDelete': 'Exporter / supprimer les donnees',
      'settings.security.currentPassword': 'Mot de passe actuel',
      'settings.security.newPassword': 'Nouveau mot de passe',
      'settings.security.confirmPassword': 'Confirmer le nouveau mot de passe',
      'settings.security.updatePassword': 'Mettre a jour le mot de passe',
      'settings.security.disable2faConfirm': "Desactiver l'authentification a deux facteurs pour ce compte ?",
      'settings.security.viewSessionsFuture': 'La gestion des sessions actives sera disponible dans une prochaine mise a jour.',
      'settings.security.exportDeleteFuture': "Les outils d'export et de suppression des donnees seront disponibles dans une prochaine mise a jour.",
      'settings.action.edit': 'Modifier',
      'settings.action.action': 'Action',
      'settings.action.setup': 'Configurer',
      'settings.action.open': 'Ouvrir',
      'settings.action.view': 'Voir',
      'settings.appPreferences.title': "Preferences de l'application",
      'settings.appPreferences.theme': 'Theme',
      'settings.appPreferences.language': 'Langue',
      'settings.appPreferences.units': 'Unites',
      'settings.theme.system': 'Systeme',
      'settings.theme.light': 'Clair',
      'settings.theme.dark': 'Sombre',
      'settings.language.english': 'Anglais',
      'settings.language.spanish': 'Espagnol',
      'settings.language.french': 'Francais',
      'settings.units.metric': 'Metrique',
      'settings.units.imperial': 'Imperial',
      'settings.support.title': 'Support et informations',
      'settings.support.helpFaqs': 'Aide et FAQ',
      'settings.support.contactSupport': 'Contacter le support',
      'settings.support.aboutPhysioApp': 'A propos de PhysioApp',
      'settings.support.terms': 'Conditions d utilisation',
      'settings.support.privacy': 'Politique de confidentialite',
      'settings.support.disclaimer': "Cette application ne remplace pas un avis medical.",
      'settings.support.fallback': 'Page de support',
      'settings.support.notConnected': "n'est pas encore connecte.",
      'settings.status.saving': 'Enregistrement...',
      'settings.status.saved': 'Les modifications ont ete enregistrees.',
      'settings.status.failedSavePreference': "Echec de l'enregistrement de la preference.",
      'settings.status.loadingWorkoutPrefs': 'Chargement de vos preferences...',
      'settings.status.failedLoadWorkoutPrefs': "Impossible de charger les preferences d'entrainement.",
      'settings.status.failedSaveNotificationPreference': "Echec de l'enregistrement des notifications.",
      'settings.status.loadingNotificationPrefs': 'Chargement des preferences de notifications...',
      'settings.status.failedLoadNotificationPrefs': 'Impossible de charger les preferences de notifications.',
      'settings.status.languageChanged': 'Langue changee en',
      'common.nav.dashboard': 'Tableau de bord',
      'common.submit': 'Soumettre',
      'common.completed': 'Termine',
      'category.title': "Que voulez-vous faire aujourd'hui ?",
      'category.workoutType': "Type d'entrainement :",
      'where.title': 'Ou vous entrainez-vous ?',
      'muscle.title': 'Zone cible',
      'exercises.selectTitle': 'Selectionner des exercices',
      'exercises.yourRoutine': 'Votre routine :',
      'exercises.showRoutine': 'Afficher la routine',
      'exercises.saveNewSearch': 'Sauver et nouvelle recherche',
      'exercises.resetNewSearch': 'Reinitialiser et nouvelle recherche',
      'favourites.title': 'Vos exercices favoris',
      'favourites.addToRoutine': 'Ajouter a la routine :',
      'favourites.removeFromFavourites': 'Retirer des favoris :',
      'favourites.saveChanges': 'Enregistrer les modifications',
      'routine.title': "Votre routine d'exercices",
      'routine.restart': 'Redemarrer la routine',
      'routine.newSearch': 'Nouvelle recherche',
      'routine.showFavourites': 'Afficher les favoris',
      'routine.allCompleted': 'Tous les exercices de votre routine sont termines !',
      'routine.painCheckin.title': 'Controle douleur post-entrainement',
      'routine.painCheckin.submit': 'Envoyer la douleur',
      'routine.painCheckin.disabled': 'Le controle douleur est desactive dans vos parametres. Entrainement termine.',
      'goals.title': 'Vos objectifs',
      'goals.saved': 'Vos objectifs enregistres',
      'goals.focus': 'Sur quoi voulez-vous vous concentrer ?',
      'goals.growth': 'Quel niveau de progression ?',
      'goals.notesOptional': 'Notes (optionnel)',
      'goals.saveBtn': 'Enregistrer mes objectifs',
      'about.title': 'A propos de PhysioApp',
      'about.subtitle': 'Vous aider a rester actif et en bonne sante, a la maison ou en salle.',
      'about.homeTitle': 'Entrainements a domicile',
      'about.homeBody': 'Exercices rapides sans equipement.',
      'about.gymTitle': 'Entrainements en salle',
      'about.gymBody': 'Routines avec equipement standard de salle.',
      'about.mobilityTitle': 'Etirements et mobilite',
      'about.mobilityBody': 'Ameliore la flexibilite et previent les blessures.',
      'info.title': 'Bienvenue sur PhysioApp',
      'info.subtitle': 'Avant les routines ou exercices, suivez ces etapes :',
      'info.step1Label': 'Etape 1 :',
      'info.step1Body': 'Aller au tableau de bord.',
      'info.step2Label': 'Etape 2 :',
      'info.step2Body': 'Cliquez sur Demarrer un entrainement.',
      'info.step3Label': 'Etape 3 :',
      'info.step3Body': 'Choisissez votre lieu (Maison ou Salle).',
      'info.step4Label': 'Etape 4 :',
      'info.step4Body': 'Selectionnez categorie et groupe musculaire pour creer votre routine.',
      'info.goToDashboard': 'Aller au tableau de bord',
      'twofa.setup.eyebrow': 'Mise a niveau securite',
      'twofa.setup.title': "Configurer l'authentification a deux facteurs",
      'twofa.setup.enable': 'Activer 2FA',
      'twofa.setup.cancel': 'Annuler et revenir aux parametres',
      'twofa.verify.eyebrow': 'Controle deux facteurs',
      'twofa.verify.title': 'Verifier la connexion',
      'twofa.verify.helper': "Ouvrez votre application d'authentification et entrez le code actuel.",
      'twofa.verify.codeLabel': 'Code a 6 chiffres',
      'twofa.verify.button': 'Verifier',
      'twofa.verify.back': 'Retour a la connexion',
      'auth.goHome': "Aller a l'accueil",
      'auth.username': "Nom d'utilisateur",
      'auth.password': 'Mot de passe',
      'auth.reset': 'Reinitialiser',
      'auth.here': 'ici',
      'auth.login.title': 'Connectez-vous a votre compte',
      'auth.login.submit': 'Connexion',
      'auth.login.noAccount': "Vous n'avez pas de compte ? Cliquez",
      'auth.login.toSignUp': 'pour vous inscrire',
      'auth.register.title': 'Creez votre compte',
      'auth.register.email': 'Adresse e-mail',
      'auth.register.retypePassword': 'Retaper le mot de passe',
      'auth.register.terms': "J'accepte les conditions generales",
      'auth.register.submit': "S'inscrire",
      'auth.register.haveAccount': 'Vous avez un compte ? Cliquez',
      'auth.register.toSignIn': 'pour vous connecter',
      'dashboard.nav.exercises': 'Exercices',
      'dashboard.nav.routines': 'Routines',
      'dashboard.nav.favourites': 'Favoris',
      'dashboard.nav.about': 'A propos',
      'dashboard.nav.howto': 'Mode d emploi',
      'dashboard.nav.settings': 'Parametres',
      'dashboard.nav.enable2fa': 'Activer 2FA',
      'dashboard.nav.disable2fa': 'Desactiver 2FA',
      'dashboard.title': 'Votre progression',
      'dashboard.stat.nextBreak': 'Prochain jour de repos',
      'dashboard.stat.streak': 'Serie actuelle',
      'dashboard.stat.lastWorkout': 'Derniere seance',
      'dashboard.cta.startWorkout': 'Demarrer un entrainement',
      'dashboard.cta.goals': 'Vos objectifs',
      'dashboard.logout': 'Se deconnecter'
    }
  };
  let activeLanguage = 'english';
  const DYNAMIC_EXACT = {
    spanish: {
      location: { home: 'Casa', gym: 'Gimnasio' },
      category: { stretch: 'Estiramiento', strengthen: 'Fortalecimiento', avoid: 'Evitar' },
      muscle: {
        chest: 'Pecho',
        back: 'Espalda',
        shoulder: 'Hombro',
        shoulders: 'Hombros',
        neck: 'Cuello',
        wrist: 'Muneca',
        elbow: 'Codo',
        hip: 'Cadera',
        glutes: 'Gluteos',
        knee: 'Rodilla',
        ankle: 'Tobillo',
        foot: 'Pie',
        core: 'Core'
      }
    },
    french: {
      location: { home: 'Maison', gym: 'Salle' },
      category: { stretch: 'Etirement', strengthen: 'Renforcement', avoid: 'Eviter' },
      muscle: {
        chest: 'Poitrine',
        back: 'Dos',
        shoulder: 'Epaule',
        shoulders: 'Epaules',
        neck: 'Cou',
        wrist: 'Poignet',
        elbow: 'Coude',
        hip: 'Hanche',
        glutes: 'Fessiers',
        knee: 'Genou',
        ankle: 'Cheville',
        foot: 'Pied',
        core: 'Centre'
      }
    }
  };

  const DYNAMIC_WORDS = {
    spanish: {
      exercise: {
        stretch: 'Estiramiento',
        strengthening: 'Fortalecimiento',
        strengthen: 'Fortalecer',
        raise: 'Elevacion',
        raises: 'Elevaciones',
        rotation: 'Rotacion',
        extension: 'Extension',
        flexion: 'Flexion',
        side: 'Lateral',
        wall: 'Pared',
        seated: 'Sentado',
        standing: 'De pie',
        supine: 'Supino',
        hip: 'Cadera',
        knee: 'Rodilla',
        shoulder: 'Hombro',
        neck: 'Cuello',
        ankle: 'Tobillo',
        wrist: 'Muneca',
        elbow: 'Codo',
        toe: 'Dedo del pie',
        calf: 'Pantorrilla',
        hamstring: 'Isquiotibial',
        quad: 'Cuadriceps',
        glute: 'Gluteo'
      }
    },
    french: {
      exercise: {
        stretch: 'Etirement',
        strengthening: 'Renforcement',
        strengthen: 'Renforcer',
        raise: 'Elevation',
        raises: 'Elevations',
        rotation: 'Rotation',
        extension: 'Extension',
        flexion: 'Flexion',
        side: 'Lateral',
        wall: 'Mur',
        seated: 'Assis',
        standing: 'Debout',
        supine: 'Supine',
        hip: 'Hanche',
        knee: 'Genou',
        shoulder: 'Epaule',
        neck: 'Cou',
        ankle: 'Cheville',
        wrist: 'Poignet',
        elbow: 'Coude',
        toe: 'Orteil',
        calf: 'Mollet',
        hamstring: 'Ischio-jambier',
        quad: 'Quadriceps',
        glute: 'Fessier'
      }
    }
  };

  const safeGet = function (key) {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      return null;
    }
  };

  const safeSet = function (key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      // ignore
    }
  };

  const normalizeLanguage = function (value) {
    return Object.prototype.hasOwnProperty.call(SUPPORTED, value) ? value : 'english';
  };

  const normalizeDynamicKey = function (value) {
    return String(value || '').trim().toLowerCase().replace(/[’']/g, "'");
  };

  const escapeRegExp = function (value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  const replaceWords = function (text, replacements) {
    if (!text || !replacements) return text;
    let output = String(text);
    Object.keys(replacements)
      .sort(function (a, b) { return b.length - a.length; })
      .forEach(function (rawKey) {
        const translated = replacements[rawKey];
        const regex = new RegExp('\\b' + escapeRegExp(rawKey) + '\\b', 'gi');
        output = output.replace(regex, translated);
      });
    return output;
  };

  const translateDynamic = function (type, value, language) {
    const normalizedLanguage = normalizeLanguage(language || activeLanguage);
    if (normalizedLanguage === 'english') return value;

    const raw = String(value || '');
    const key = normalizeDynamicKey(raw);
    const exact = DYNAMIC_EXACT[normalizedLanguage]
      && DYNAMIC_EXACT[normalizedLanguage][type]
      && DYNAMIC_EXACT[normalizedLanguage][type][key];
    if (exact) return exact;

    if (type === 'exercise') {
      const wordMap = DYNAMIC_WORDS[normalizedLanguage] && DYNAMIC_WORDS[normalizedLanguage].exercise;
      return replaceWords(raw, wordMap);
    }

    return raw;
  };

  const getLanguagePreference = function () {
    const fromPrimary = normalizeLanguage(safeGet(STORAGE_KEY));
    if (safeGet(STORAGE_KEY)) {
      return fromPrimary;
    }

    const rawLegacy = safeGet(LEGACY_KEY);
    if (!rawLegacy) return 'english';

    try {
      const parsed = JSON.parse(rawLegacy);
      return normalizeLanguage(parsed && parsed.app && parsed.app.languageSelector);
    } catch (error) {
      return 'english';
    }
  };

  const updateLegacyState = function (language) {
    const rawLegacy = safeGet(LEGACY_KEY);
    let legacyState = { app: {} };

    if (rawLegacy) {
      try {
        legacyState = JSON.parse(rawLegacy) || { app: {} };
      } catch (error) {
        legacyState = { app: {} };
      }
    }

    legacyState.app = Object.assign({}, legacyState.app || {}, { languageSelector: language });
    safeSet(LEGACY_KEY, JSON.stringify(legacyState));
  };

  const applyTranslations = function (language) {
    const dictionary = TRANSLATIONS[normalizeLanguage(language)] || TRANSLATIONS.english;

    document.querySelectorAll('[data-i18n]').forEach(function (element) {
      const key = element.getAttribute('data-i18n');
      if (!key) return;
      const translated = dictionary[key];
      if (typeof translated === 'string') {
        element.textContent = translated;
      }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (element) {
      const key = element.getAttribute('data-i18n-placeholder');
      if (!key) return;
      const translated = dictionary[key];
      if (typeof translated === 'string') {
        element.setAttribute('placeholder', translated);
      }
    });

    document.querySelectorAll('[data-i18n-aria-label]').forEach(function (element) {
      const key = element.getAttribute('data-i18n-aria-label');
      if (!key) return;
      const translated = dictionary[key];
      if (typeof translated === 'string') {
        element.setAttribute('aria-label', translated);
      }
    });

    document.documentElement.lang = SUPPORTED[normalizeLanguage(language)] || 'en';
  };

  const t = function (key, fallback) {
    const dictionary = TRANSLATIONS[activeLanguage] || TRANSLATIONS.english;
    return dictionary[key] || fallback || key;
  };

  const applyLanguage = function (language) {
    activeLanguage = normalizeLanguage(language);
    applyTranslations(activeLanguage);
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(new CustomEvent('physio-language-changed', {
        detail: { language: activeLanguage }
      }));
    }
    return activeLanguage;
  };

  const setLanguage = function (language) {
    const normalized = normalizeLanguage(language);
    safeSet(STORAGE_KEY, normalized);
    updateLegacyState(normalized);
    return applyLanguage(normalized);
  };

  const bindLanguageSelector = function (preferred) {
    const selector = document.getElementById('languageSelector');
    if (!selector) return;

    selector.value = normalizeLanguage(preferred);
    if (selector.dataset.languageBound === 'true') return;

    selector.addEventListener('change', function () {
      setLanguage(selector.value);
    });
    selector.dataset.languageBound = 'true';
  };

  const initLanguage = function () {
    const preferred = getLanguagePreference();
    applyLanguage(preferred);
    bindLanguageSelector(preferred);
    return preferred;
  };

  window.PhysioLanguage = {
    getLanguagePreference,
    setLanguage,
    applyLanguage,
    initLanguage,
    t,
    translateDynamic
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLanguage, { once: true });
  } else {
    initLanguage();
  }
})();
