const { operation0 } = require('../../../../../step-configs/BusinessRule/BusinessRule_DevCloudinaryResponseMapper');

const SAMPLE_RESPONSE = JSON.stringify({
  asset_id          : "abc123def456",
  public_id         : "dev_assets/sv_12345_front",
  version           : 1674856123,
  created_at        : "2023-01-27T22:48:43Z",
  original_filename : "sv_12345_front_flat",
  secure_url        : "https://res.cloudinary.com/stitch-fix/image/upload/v1674856123/dev_assets/sv_12345_front.jpg"
});

describe("DevCloudinaryResponseMapper", () => {

  describe("photo_asset_id derivation", () => {
    test("strips DEV_ prefix from node ID", () => {
      const result = JSON.parse(operation0(SAMPLE_RESPONSE, "DEV_12345"));
      expect(result.photo_asset_id).toBe("12345");
    });

    test("strips prefix case-insensitively", () => {
      const result = JSON.parse(operation0(SAMPLE_RESPONSE, "dev_99999"));
      expect(result.photo_asset_id).toBe("99999");
    });

    test("returns full ID when no DEV_ prefix is present", () => {
      const result = JSON.parse(operation0(SAMPLE_RESPONSE, "12345"));
      expect(result.photo_asset_id).toBe("12345");
    });

    test("uses explicit asset_id argument over svKey", () => {
      const result = JSON.parse(operation0(SAMPLE_RESPONSE, "DEV_12345", "DEV_77777"));
      expect(result.photo_asset_id).toBe("77777");
    });

    test("strips DA_ prefix from explicit asset_id", () => {
      const result = JSON.parse(operation0(SAMPLE_RESPONSE, "DEV_12345", "DA_55555"));
      expect(result.photo_asset_id).toBe("55555");
    });
  });

  describe("Cloudinary field mapping", () => {
    test("maps cloudinary_public_id from public_id", () => {
      const result = JSON.parse(operation0(SAMPLE_RESPONSE, "DEV_12345"));
      expect(result.cloudinary_public_id).toBe("dev_assets/sv_12345_front");
    });

    test("maps cloudinary_version from version as a string", () => {
      const result = JSON.parse(operation0(SAMPLE_RESPONSE, "DEV_12345"));
      expect(result.cloudinary_version).toBe("1674856123");
    });

    test("maps cloudinary_asset_identification from asset_id", () => {
      const result = JSON.parse(operation0(SAMPLE_RESPONSE, "DEV_12345"));
      expect(result.cloudinary_asset_identification).toBe("abc123def456");
    });

    test("maps original_file_path from original_filename", () => {
      const result = JSON.parse(operation0(SAMPLE_RESPONSE, "DEV_12345"));
      expect(result.original_file_path).toBe("sv_12345_front_flat");
    });
  });

  describe("asset_created_at date formatting", () => {
    test("converts ISO 8601 to STEP date format (T→space, Z→empty)", () => {
      const result = JSON.parse(operation0(SAMPLE_RESPONSE, "DEV_1"));
      expect(result.asset_created_at).toBe("2023-01-27 22:48:43");
    });

    test("handles midnight UTC correctly", () => {
      const response = JSON.stringify({ public_id: "x", version: 1, created_at: "2024-06-01T00:00:00Z" });
      const result = JSON.parse(operation0(response, "DEV_1"));
      expect(result.asset_created_at).toBe("2024-06-01 00:00:00");
    });
  });

  describe("version edge cases", () => {
    test("returns '0' when version is 0", () => {
      const response = JSON.stringify({ public_id: "x", version: 0, created_at: "2023-01-01T00:00:00Z" });
      const result = JSON.parse(operation0(response, "DEV_1"));
      expect(result.cloudinary_version).toBe("0");
    });

    test("returns empty string when version is null", () => {
      const response = JSON.stringify({ public_id: "x", version: null, created_at: "2023-01-01T00:00:00Z" });
      const result = JSON.parse(operation0(response, "DEV_1"));
      expect(result.cloudinary_version).toBe("");
    });
  });

  describe("missing optional fields", () => {
    test("returns empty strings for absent optional Cloudinary fields", () => {
      const minimal = JSON.stringify({ public_id: "some/path", version: 1234, created_at: "2023-06-01T12:00:00Z" });
      const result = JSON.parse(operation0(minimal, "DEV_111"));
      expect(result.cloudinary_asset_identification).toBe("");
      expect(result.original_file_path).toBe("");
    });

    test("returns empty string when created_at is absent", () => {
      const response = JSON.stringify({ public_id: "x", version: 1 });
      const result = JSON.parse(operation0(response, "DEV_1"));
      expect(result.asset_created_at).toBe("");
    });
  });

  describe("output shape", () => {
    test("returns all expected keys", () => {
      const result = JSON.parse(operation0(SAMPLE_RESPONSE, "DEV_1"));
      expect(Object.keys(result)).toEqual(expect.arrayContaining([
        "photo_asset_id",
        "cloudinary_public_id",
        "cloudinary_version",
        "asset_created_at",
        "cloudinary_asset_identification",
        "original_file_path",
        "action_code",
        "is_style_variant_primary_image",
        "developmental",
        "style_variant_id"
      ]));
    });

    test("sets style_variant_id only when explicit asset_id is provided", () => {
      const fallback = JSON.parse(operation0(SAMPLE_RESPONSE, "DEV_1"));
      const explicit = JSON.parse(operation0(SAMPLE_RESPONSE, "DEV_1", "DEV_2"));

      expect(fallback.style_variant_id).toBe("");
      expect(explicit.style_variant_id).toBe("DEV_1");
    });

    test("sets constant flags and action code", () => {
      const result = JSON.parse(operation0(SAMPLE_RESPONSE, "DEV_1", "DEV_2"));
      expect(result.action_code).toBe("UPSERT");
      expect(result.is_style_variant_primary_image).toBe(false);
      expect(result.developmental).toBe(true);
    });
  });
});
