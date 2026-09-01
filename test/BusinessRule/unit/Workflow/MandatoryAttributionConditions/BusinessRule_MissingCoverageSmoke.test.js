const path = require('path');
const { runUnitSmokeCases } = require(path.resolve(process.cwd(), 'test/BusinessRule/support/utils/businessRuleCoverage'));

runUnitSmokeCases("Unit smoke coverage for test/BusinessRule/unit/Workflow/MandatoryAttributionConditions", [
    {
        "businessRuleId": "all_materials_condition",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_all_materials_condition.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "artwork_type_condition",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_artwork_type_condition.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "back_pockets_condition",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_back_pockets_condition.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "bag_closure_condition",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_bag_closure_condition.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "bag_depth_condition",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_bag_depth_condition.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "bag_height_condition",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_bag_height_condition.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "bag_width_condition",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_bag_width_condition.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "bottom_closure_condition",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_bottom_closure_condition.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "bottom_waistband_condition",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_bottom_waistband_condition.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "bra_strap_condition",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_bra_strap_condition.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "bra_type_condition",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_bra_type_condition.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "button_down_condition",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_button_down_condition.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "color_group_condition",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_color_group_condition.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "common_fabric_condition",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_common_fabric_condition.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "cuff_condition",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_cuff_condition.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "distressed_condition",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_distressed_condition.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "dress_skirt_length_condition",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_dress_skirt_length_condition.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "embellishment_embroidery_condition",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_embellishment_embroidery_condition.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "exact_heel_height_condition",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_exact_heel_height_condition.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "fabric_construction_condition",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_fabric_construction_condition.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "fabric_content_condition",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_fabric_content_condition.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "fabric_weight_condition",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_fabric_weight_condition.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "faux_fur_coverage_condition",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_faux_fur_coverage_condition.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "faux_leather_coverage_condition",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_faux_leather_coverage_condition.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "faux_suede_coverage_condition",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_faux_suede_coverage_condition.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "fit_complete_at_condition",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_fit_complete_at_condition.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "foot_width_match_condition",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_foot_width_match_condition.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "footwear_back_condition",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_footwear_back_condition.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "footwear_fastening_type_condition",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_footwear_fastening_type_condition.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "footwear_instep_condition",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_footwear_instep_condition.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "footwear_primary_material_condition",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_footwear_primary_material_condition.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "footwear_style_condition",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_footwear_style_condition.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "footwear_toe_condition",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_footwear_toe_condition.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "front_pockets_condition",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_front_pockets_condition.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "garment_care_condition",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_garment_care_condition.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "has_artwork_condition",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_has_artwork_condition.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "has_back_detail_condition",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_has_back_detail_condition.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "has_belt_condition",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_has_belt_condition.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "has_cami_condition",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_has_cami_condition.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "has_collar_condition",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_has_collar_condition.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "has_crossbody_option_condition",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_has_crossbody_option_condition.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "has_curved_waistband_condition",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_has_curved_waistband_condition.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "has_external_pockets_condition",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_has_external_pockets_condition.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "has_pom_value_condition",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_has_pom_value_condition.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "has_sequins_condition",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_has_sequins_condition.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "has_zip_front_condition",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_has_zip_front_condition.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "heel_fabrication_condition",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_heel_fabrication_condition.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "heel_height_tier_inches_condition",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_heel_height_tier_inches_condition.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "heel_type_condition",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_heel_type_condition.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "hemline_front_vs_back_condition",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_hemline_front_vs_back_condition.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "hood_condition",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_hood_condition.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "is_adjustable_condition",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_is_adjustable_condition.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "is_cargo_condition",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_is_cargo_condition.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "is_do_not_ship_condition",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_is_do_not_ship_condition.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "is_extras_eligible_condition",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_is_extras_eligible_condition.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "is_maternity_condition",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_is_maternity_condition.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "is_mixed_material_condition",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_is_mixed_material_condition.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "is_petite_condition",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_is_petite_condition.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "is_plus_condition",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_is_plus_condition.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "is_reversible_condition",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_is_reversible_condition.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "is_set_condition",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_is_set_condition.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "is_shop_eligible_condition",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_is_shop_eligible_condition.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "is_sustainable_materials_condition",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_is_sustainable_materials_condition.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "is_textured_fabric_condition",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_is_textured_fabric_condition.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "jewelry_style_condition",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_jewelry_style_condition.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "kids_principal_fabric_condition",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_kids_principal_fabric_condition.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "layering_type_condition",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_layering_type_condition.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "leather_appearance_condition",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_leather_appearance_condition.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "maternity_status_condition",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_maternity_status_condition.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "metal_color_condition",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_metal_color_condition.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "metal_finish_condition",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_metal_finish_condition.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "neck_line_condition",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_neck_line_condition.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "pants_shorts_length_condition",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_pants_shorts_length_condition.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "performance_property_condition",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_performance_property_condition.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "placket_type_condition",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_placket_type_condition.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "primary_material_condition",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_primary_material_condition.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "scarf_trim_condition",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_scarf_trim_condition.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "second_layer_lining_condition",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_second_layer_lining_condition.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "shirt_collar_condition",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_shirt_collar_condition.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "shirt_hemline_condition",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_shirt_hemline_condition.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "shirt_pocket_type_condition",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_shirt_pocket_type_condition.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "shirt_pockets_condition",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_shirt_pockets_condition.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "skirt_lining_condition",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_skirt_lining_condition.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "sleeve_length_condition",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_sleeve_length_condition.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "sleeve_type_condition",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_sleeve_type_condition.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "sole_type_condition",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_sole_type_condition.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "solid_or_non_solid_condition",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_solid_or_non_solid_condition.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "stone_condition",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_stone_condition.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "strap_condition",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_strap_condition.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "strap_primary_material_condition",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_strap_primary_material_condition.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "stretch_condition",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_stretch_condition.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "subclassification_condition",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_subclassification_condition.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "tag_type_condition",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_tag_type_condition.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "texture_condition",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_texture_condition.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "toe_shape_condition",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_toe_shape_condition.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "top_dress_waistband_condition",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_top_dress_waistband_condition.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "top_style_length_condition",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_top_style_length_condition.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "top_underlay_condition",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_top_underlay_condition.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "yarn_texture_condition",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_yarn_texture_condition.js",
        "businessRuleType": "BusinessCondition"
    }
]);
