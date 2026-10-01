export const OPTION_CARD_GROUP_STORY_COPY = {
  label: "Pilih sumber foto",
  googleDrive: {
    value: "GOOGLE_DRIVE",
    title: "Google Drive",
    description: "Hubungkan folder Google Drive sebagai sumber foto.",
  },
  dropbox: {
    value: "DROPBOX",
    title: "Dropbox",
    description: "Gunakan folder Dropbox sebagai sumber foto.",
    badge: "Segera hadir",
  },
  onedrive: { value: "ONEDRIVE", title: "OneDrive" },
  amazonS3: { value: "AMAZON_S3", title: "Amazon S3" },
  customUrl: { value: "CUSTOM_URL", title: "Custom URL" },
} as const;
