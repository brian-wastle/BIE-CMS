import { z } from 'zod';
export declare const BlockTypeSchema: z.ZodEnum<{
    text: "text";
    image: "image";
    video: "video";
    title: "title";
    byline: "byline";
    background: "background";
}>;
export type BlockType = z.infer<typeof BlockTypeSchema>;
export declare const AlignTypeSchema: z.ZodEnum<{
    "flex-start": "flex-start";
    center: "center";
    "flex-end": "flex-end";
}>;
export type AlignType = z.infer<typeof AlignTypeSchema>;
export declare const BreakpointIdSchema: z.ZodEnum<{
    mobile: "mobile";
    tablet: "tablet";
    desktop: "desktop";
}>;
export type BreakpointId = z.infer<typeof BreakpointIdSchema>;
export declare const ViewModeSchema: z.ZodEnum<{
    list: "list";
    grid: "grid";
}>;
export type ViewMode = z.infer<typeof ViewModeSchema>;
export declare const BGStyleSchema: z.ZodEnum<{
    stretch: "stretch";
    tile: "tile";
}>;
export type BGStyle = z.infer<typeof BGStyleSchema>;
export declare const GridPlacementSchema: z.ZodObject<{
    row: z.ZodCoercedNumber<unknown>;
    colStart: z.ZodCoercedNumber<unknown>;
    colSpan: z.ZodCoercedNumber<unknown>;
    rowSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export type GridPlacement = z.infer<typeof GridPlacementSchema>;
export declare const OverrideSchema: z.ZodObject<{
    fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
    layout: z.ZodOptional<z.ZodObject<{
        row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
        colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
        colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
        rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
    }, z.core.$strip>>;
    hAlign: z.ZodOptional<z.ZodEnum<{
        "flex-start": "flex-start";
        center: "center";
        "flex-end": "flex-end";
    }>>;
    vAlign: z.ZodOptional<z.ZodEnum<{
        "flex-start": "flex-start";
        center: "center";
        "flex-end": "flex-end";
    }>>;
}, z.core.$strip>;
export type ResponsiveOverride = z.infer<typeof OverrideSchema>;
export declare const ResponsiveOverridesSchema: z.ZodObject<{
    mobile: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
        layout: z.ZodOptional<z.ZodObject<{
            row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
            colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
            colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
            rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
        }, z.core.$strip>>;
        hAlign: z.ZodOptional<z.ZodEnum<{
            "flex-start": "flex-start";
            center: "center";
            "flex-end": "flex-end";
        }>>;
        vAlign: z.ZodOptional<z.ZodEnum<{
            "flex-start": "flex-start";
            center: "center";
            "flex-end": "flex-end";
        }>>;
    }, z.core.$strip>>>;
    tablet: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
        layout: z.ZodOptional<z.ZodObject<{
            row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
            colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
            colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
            rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
        }, z.core.$strip>>;
        hAlign: z.ZodOptional<z.ZodEnum<{
            "flex-start": "flex-start";
            center: "center";
            "flex-end": "flex-end";
        }>>;
        vAlign: z.ZodOptional<z.ZodEnum<{
            "flex-start": "flex-start";
            center: "center";
            "flex-end": "flex-end";
        }>>;
    }, z.core.$strip>>>;
    desktop: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
        layout: z.ZodOptional<z.ZodObject<{
            row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
            colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
            colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
            rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
        }, z.core.$strip>>;
        hAlign: z.ZodOptional<z.ZodEnum<{
            "flex-start": "flex-start";
            center: "center";
            "flex-end": "flex-end";
        }>>;
        vAlign: z.ZodOptional<z.ZodEnum<{
            "flex-start": "flex-start";
            center: "center";
            "flex-end": "flex-end";
        }>>;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export type ResponsiveOverrides = z.infer<typeof ResponsiveOverridesSchema>;
export declare const ImageStyleSchema: z.ZodObject<{
    columns: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
}, z.core.$strict>;
export type ImageStyle = z.infer<typeof ImageStyleSchema>;
export declare const TitleBlockSchema: z.ZodObject<{
    id: z.ZodString;
    layout: z.ZodObject<{
        row: z.ZodCoercedNumber<unknown>;
        colStart: z.ZodCoercedNumber<unknown>;
        colSpan: z.ZodCoercedNumber<unknown>;
        rowSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    }, z.core.$strip>;
    fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
    hAlign: z.ZodEnum<{
        "flex-start": "flex-start";
        center: "center";
        "flex-end": "flex-end";
    }>;
    vAlign: z.ZodEnum<{
        "flex-start": "flex-start";
        center: "center";
        "flex-end": "flex-end";
    }>;
    responsive: z.ZodOptional<z.ZodObject<{
        mobile: z.ZodOptional<z.ZodOptional<z.ZodObject<{
            fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
            layout: z.ZodOptional<z.ZodObject<{
                row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
            }, z.core.$strip>>;
            hAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
            vAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
        }, z.core.$strip>>>;
        tablet: z.ZodOptional<z.ZodOptional<z.ZodObject<{
            fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
            layout: z.ZodOptional<z.ZodObject<{
                row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
            }, z.core.$strip>>;
            hAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
            vAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
        }, z.core.$strip>>>;
        desktop: z.ZodOptional<z.ZodOptional<z.ZodObject<{
            fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
            layout: z.ZodOptional<z.ZodObject<{
                row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
            }, z.core.$strip>>;
            hAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
            vAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
        }, z.core.$strip>>>;
    }, z.core.$strip>>;
    type: z.ZodLiteral<"title">;
    text: z.ZodString;
}, z.core.$strip>;
export type TitleBlock = z.infer<typeof TitleBlockSchema>;
export declare const BylineBlockSchema: z.ZodObject<{
    id: z.ZodString;
    layout: z.ZodObject<{
        row: z.ZodCoercedNumber<unknown>;
        colStart: z.ZodCoercedNumber<unknown>;
        colSpan: z.ZodCoercedNumber<unknown>;
        rowSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    }, z.core.$strip>;
    fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
    hAlign: z.ZodEnum<{
        "flex-start": "flex-start";
        center: "center";
        "flex-end": "flex-end";
    }>;
    vAlign: z.ZodEnum<{
        "flex-start": "flex-start";
        center: "center";
        "flex-end": "flex-end";
    }>;
    responsive: z.ZodOptional<z.ZodObject<{
        mobile: z.ZodOptional<z.ZodOptional<z.ZodObject<{
            fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
            layout: z.ZodOptional<z.ZodObject<{
                row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
            }, z.core.$strip>>;
            hAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
            vAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
        }, z.core.$strip>>>;
        tablet: z.ZodOptional<z.ZodOptional<z.ZodObject<{
            fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
            layout: z.ZodOptional<z.ZodObject<{
                row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
            }, z.core.$strip>>;
            hAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
            vAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
        }, z.core.$strip>>>;
        desktop: z.ZodOptional<z.ZodOptional<z.ZodObject<{
            fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
            layout: z.ZodOptional<z.ZodObject<{
                row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
            }, z.core.$strip>>;
            hAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
            vAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
        }, z.core.$strip>>>;
    }, z.core.$strip>>;
    type: z.ZodLiteral<"byline">;
    author: z.ZodString;
    publishedAt: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type BylineBlock = z.infer<typeof BylineBlockSchema>;
export declare const TextBlockSchema: z.ZodObject<{
    id: z.ZodString;
    layout: z.ZodObject<{
        row: z.ZodCoercedNumber<unknown>;
        colStart: z.ZodCoercedNumber<unknown>;
        colSpan: z.ZodCoercedNumber<unknown>;
        rowSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    }, z.core.$strip>;
    fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
    hAlign: z.ZodEnum<{
        "flex-start": "flex-start";
        center: "center";
        "flex-end": "flex-end";
    }>;
    vAlign: z.ZodEnum<{
        "flex-start": "flex-start";
        center: "center";
        "flex-end": "flex-end";
    }>;
    responsive: z.ZodOptional<z.ZodObject<{
        mobile: z.ZodOptional<z.ZodOptional<z.ZodObject<{
            fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
            layout: z.ZodOptional<z.ZodObject<{
                row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
            }, z.core.$strip>>;
            hAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
            vAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
        }, z.core.$strip>>>;
        tablet: z.ZodOptional<z.ZodOptional<z.ZodObject<{
            fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
            layout: z.ZodOptional<z.ZodObject<{
                row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
            }, z.core.$strip>>;
            hAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
            vAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
        }, z.core.$strip>>>;
        desktop: z.ZodOptional<z.ZodOptional<z.ZodObject<{
            fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
            layout: z.ZodOptional<z.ZodObject<{
                row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
            }, z.core.$strip>>;
            hAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
            vAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
        }, z.core.$strip>>>;
    }, z.core.$strip>>;
    type: z.ZodLiteral<"text">;
    text: z.ZodString;
}, z.core.$strip>;
export type TextBlock = z.infer<typeof TextBlockSchema>;
export declare const ImageBlockSchema: z.ZodObject<{
    id: z.ZodString;
    layout: z.ZodObject<{
        row: z.ZodCoercedNumber<unknown>;
        colStart: z.ZodCoercedNumber<unknown>;
        colSpan: z.ZodCoercedNumber<unknown>;
        rowSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    }, z.core.$strip>;
    fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
    hAlign: z.ZodEnum<{
        "flex-start": "flex-start";
        center: "center";
        "flex-end": "flex-end";
    }>;
    vAlign: z.ZodEnum<{
        "flex-start": "flex-start";
        center: "center";
        "flex-end": "flex-end";
    }>;
    responsive: z.ZodOptional<z.ZodObject<{
        mobile: z.ZodOptional<z.ZodOptional<z.ZodObject<{
            fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
            layout: z.ZodOptional<z.ZodObject<{
                row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
            }, z.core.$strip>>;
            hAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
            vAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
        }, z.core.$strip>>>;
        tablet: z.ZodOptional<z.ZodOptional<z.ZodObject<{
            fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
            layout: z.ZodOptional<z.ZodObject<{
                row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
            }, z.core.$strip>>;
            hAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
            vAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
        }, z.core.$strip>>>;
        desktop: z.ZodOptional<z.ZodOptional<z.ZodObject<{
            fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
            layout: z.ZodOptional<z.ZodObject<{
                row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
            }, z.core.$strip>>;
            hAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
            vAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
        }, z.core.$strip>>>;
    }, z.core.$strip>>;
    type: z.ZodLiteral<"image">;
    src: z.ZodString;
    alt: z.ZodOptional<z.ZodString>;
    mediaHandle: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    imageStyle: z.ZodOptional<z.ZodObject<{
        columns: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    }, z.core.$strict>>;
}, z.core.$strip>;
export type ImageBlock = z.infer<typeof ImageBlockSchema>;
export declare const BGBlockSchema: z.ZodObject<{
    id: z.ZodString;
    layout: z.ZodObject<{
        row: z.ZodCoercedNumber<unknown>;
        colStart: z.ZodCoercedNumber<unknown>;
        colSpan: z.ZodCoercedNumber<unknown>;
        rowSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    }, z.core.$strip>;
    fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
    hAlign: z.ZodEnum<{
        "flex-start": "flex-start";
        center: "center";
        "flex-end": "flex-end";
    }>;
    vAlign: z.ZodEnum<{
        "flex-start": "flex-start";
        center: "center";
        "flex-end": "flex-end";
    }>;
    responsive: z.ZodOptional<z.ZodObject<{
        mobile: z.ZodOptional<z.ZodOptional<z.ZodObject<{
            fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
            layout: z.ZodOptional<z.ZodObject<{
                row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
            }, z.core.$strip>>;
            hAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
            vAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
        }, z.core.$strip>>>;
        tablet: z.ZodOptional<z.ZodOptional<z.ZodObject<{
            fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
            layout: z.ZodOptional<z.ZodObject<{
                row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
            }, z.core.$strip>>;
            hAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
            vAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
        }, z.core.$strip>>>;
        desktop: z.ZodOptional<z.ZodOptional<z.ZodObject<{
            fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
            layout: z.ZodOptional<z.ZodObject<{
                row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
            }, z.core.$strip>>;
            hAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
            vAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
        }, z.core.$strip>>>;
    }, z.core.$strip>>;
    type: z.ZodLiteral<"background">;
    src: z.ZodOptional<z.ZodString>;
    color: z.ZodOptional<z.ZodString>;
    mediaHandle: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    bgStyle: z.ZodDefault<z.ZodEnum<{
        stretch: "stretch";
        tile: "tile";
    }>>;
}, z.core.$strip>;
export type BGBlock = z.infer<typeof BGBlockSchema>;
export declare const AnyBlockSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    id: z.ZodString;
    layout: z.ZodObject<{
        row: z.ZodCoercedNumber<unknown>;
        colStart: z.ZodCoercedNumber<unknown>;
        colSpan: z.ZodCoercedNumber<unknown>;
        rowSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    }, z.core.$strip>;
    fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
    hAlign: z.ZodEnum<{
        "flex-start": "flex-start";
        center: "center";
        "flex-end": "flex-end";
    }>;
    vAlign: z.ZodEnum<{
        "flex-start": "flex-start";
        center: "center";
        "flex-end": "flex-end";
    }>;
    responsive: z.ZodOptional<z.ZodObject<{
        mobile: z.ZodOptional<z.ZodOptional<z.ZodObject<{
            fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
            layout: z.ZodOptional<z.ZodObject<{
                row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
            }, z.core.$strip>>;
            hAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
            vAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
        }, z.core.$strip>>>;
        tablet: z.ZodOptional<z.ZodOptional<z.ZodObject<{
            fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
            layout: z.ZodOptional<z.ZodObject<{
                row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
            }, z.core.$strip>>;
            hAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
            vAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
        }, z.core.$strip>>>;
        desktop: z.ZodOptional<z.ZodOptional<z.ZodObject<{
            fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
            layout: z.ZodOptional<z.ZodObject<{
                row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
            }, z.core.$strip>>;
            hAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
            vAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
        }, z.core.$strip>>>;
    }, z.core.$strip>>;
    type: z.ZodLiteral<"title">;
    text: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    id: z.ZodString;
    layout: z.ZodObject<{
        row: z.ZodCoercedNumber<unknown>;
        colStart: z.ZodCoercedNumber<unknown>;
        colSpan: z.ZodCoercedNumber<unknown>;
        rowSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    }, z.core.$strip>;
    fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
    hAlign: z.ZodEnum<{
        "flex-start": "flex-start";
        center: "center";
        "flex-end": "flex-end";
    }>;
    vAlign: z.ZodEnum<{
        "flex-start": "flex-start";
        center: "center";
        "flex-end": "flex-end";
    }>;
    responsive: z.ZodOptional<z.ZodObject<{
        mobile: z.ZodOptional<z.ZodOptional<z.ZodObject<{
            fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
            layout: z.ZodOptional<z.ZodObject<{
                row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
            }, z.core.$strip>>;
            hAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
            vAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
        }, z.core.$strip>>>;
        tablet: z.ZodOptional<z.ZodOptional<z.ZodObject<{
            fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
            layout: z.ZodOptional<z.ZodObject<{
                row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
            }, z.core.$strip>>;
            hAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
            vAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
        }, z.core.$strip>>>;
        desktop: z.ZodOptional<z.ZodOptional<z.ZodObject<{
            fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
            layout: z.ZodOptional<z.ZodObject<{
                row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
            }, z.core.$strip>>;
            hAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
            vAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
        }, z.core.$strip>>>;
    }, z.core.$strip>>;
    type: z.ZodLiteral<"byline">;
    author: z.ZodString;
    publishedAt: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
    id: z.ZodString;
    layout: z.ZodObject<{
        row: z.ZodCoercedNumber<unknown>;
        colStart: z.ZodCoercedNumber<unknown>;
        colSpan: z.ZodCoercedNumber<unknown>;
        rowSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    }, z.core.$strip>;
    fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
    hAlign: z.ZodEnum<{
        "flex-start": "flex-start";
        center: "center";
        "flex-end": "flex-end";
    }>;
    vAlign: z.ZodEnum<{
        "flex-start": "flex-start";
        center: "center";
        "flex-end": "flex-end";
    }>;
    responsive: z.ZodOptional<z.ZodObject<{
        mobile: z.ZodOptional<z.ZodOptional<z.ZodObject<{
            fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
            layout: z.ZodOptional<z.ZodObject<{
                row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
            }, z.core.$strip>>;
            hAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
            vAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
        }, z.core.$strip>>>;
        tablet: z.ZodOptional<z.ZodOptional<z.ZodObject<{
            fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
            layout: z.ZodOptional<z.ZodObject<{
                row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
            }, z.core.$strip>>;
            hAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
            vAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
        }, z.core.$strip>>>;
        desktop: z.ZodOptional<z.ZodOptional<z.ZodObject<{
            fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
            layout: z.ZodOptional<z.ZodObject<{
                row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
            }, z.core.$strip>>;
            hAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
            vAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
        }, z.core.$strip>>>;
    }, z.core.$strip>>;
    type: z.ZodLiteral<"text">;
    text: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    id: z.ZodString;
    layout: z.ZodObject<{
        row: z.ZodCoercedNumber<unknown>;
        colStart: z.ZodCoercedNumber<unknown>;
        colSpan: z.ZodCoercedNumber<unknown>;
        rowSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    }, z.core.$strip>;
    fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
    hAlign: z.ZodEnum<{
        "flex-start": "flex-start";
        center: "center";
        "flex-end": "flex-end";
    }>;
    vAlign: z.ZodEnum<{
        "flex-start": "flex-start";
        center: "center";
        "flex-end": "flex-end";
    }>;
    responsive: z.ZodOptional<z.ZodObject<{
        mobile: z.ZodOptional<z.ZodOptional<z.ZodObject<{
            fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
            layout: z.ZodOptional<z.ZodObject<{
                row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
            }, z.core.$strip>>;
            hAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
            vAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
        }, z.core.$strip>>>;
        tablet: z.ZodOptional<z.ZodOptional<z.ZodObject<{
            fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
            layout: z.ZodOptional<z.ZodObject<{
                row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
            }, z.core.$strip>>;
            hAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
            vAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
        }, z.core.$strip>>>;
        desktop: z.ZodOptional<z.ZodOptional<z.ZodObject<{
            fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
            layout: z.ZodOptional<z.ZodObject<{
                row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
            }, z.core.$strip>>;
            hAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
            vAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
        }, z.core.$strip>>>;
    }, z.core.$strip>>;
    type: z.ZodLiteral<"image">;
    src: z.ZodString;
    alt: z.ZodOptional<z.ZodString>;
    mediaHandle: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    imageStyle: z.ZodOptional<z.ZodObject<{
        columns: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    }, z.core.$strict>>;
}, z.core.$strip>, z.ZodObject<{
    id: z.ZodString;
    layout: z.ZodObject<{
        row: z.ZodCoercedNumber<unknown>;
        colStart: z.ZodCoercedNumber<unknown>;
        colSpan: z.ZodCoercedNumber<unknown>;
        rowSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    }, z.core.$strip>;
    fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
    hAlign: z.ZodEnum<{
        "flex-start": "flex-start";
        center: "center";
        "flex-end": "flex-end";
    }>;
    vAlign: z.ZodEnum<{
        "flex-start": "flex-start";
        center: "center";
        "flex-end": "flex-end";
    }>;
    responsive: z.ZodOptional<z.ZodObject<{
        mobile: z.ZodOptional<z.ZodOptional<z.ZodObject<{
            fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
            layout: z.ZodOptional<z.ZodObject<{
                row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
            }, z.core.$strip>>;
            hAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
            vAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
        }, z.core.$strip>>>;
        tablet: z.ZodOptional<z.ZodOptional<z.ZodObject<{
            fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
            layout: z.ZodOptional<z.ZodObject<{
                row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
            }, z.core.$strip>>;
            hAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
            vAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
        }, z.core.$strip>>>;
        desktop: z.ZodOptional<z.ZodOptional<z.ZodObject<{
            fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
            layout: z.ZodOptional<z.ZodObject<{
                row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
            }, z.core.$strip>>;
            hAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
            vAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
        }, z.core.$strip>>>;
    }, z.core.$strip>>;
    type: z.ZodLiteral<"background">;
    src: z.ZodOptional<z.ZodString>;
    color: z.ZodOptional<z.ZodString>;
    mediaHandle: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    bgStyle: z.ZodDefault<z.ZodEnum<{
        stretch: "stretch";
        tile: "tile";
    }>>;
}, z.core.$strip>], "type">;
export type AnyBlock = z.infer<typeof AnyBlockSchema>;
export declare const BlockUpdateSchema: z.ZodObject<{
    layout: z.ZodOptional<z.ZodObject<{
        row: z.ZodCoercedNumber<unknown>;
        colStart: z.ZodCoercedNumber<unknown>;
        colSpan: z.ZodCoercedNumber<unknown>;
        rowSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    }, z.core.$strip>>;
    text: z.ZodOptional<z.ZodString>;
    src: z.ZodOptional<z.ZodString>;
    alt: z.ZodOptional<z.ZodString>;
    mediaHandle: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    imageStyle: z.ZodOptional<z.ZodObject<{
        columns: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    }, z.core.$strict>>;
    color: z.ZodOptional<z.ZodString>;
    bgStyle: z.ZodOptional<z.ZodEnum<{
        stretch: "stretch";
        tile: "tile";
    }>>;
    author: z.ZodOptional<z.ZodString>;
    format: z.ZodOptional<z.ZodString>;
    publishedAt: z.ZodOptional<z.ZodString>;
    fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
    hAlign: z.ZodOptional<z.ZodEnum<{
        "flex-start": "flex-start";
        center: "center";
        "flex-end": "flex-end";
    }>>;
    vAlign: z.ZodOptional<z.ZodEnum<{
        "flex-start": "flex-start";
        center: "center";
        "flex-end": "flex-end";
    }>>;
    responsive: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        mobile: z.ZodOptional<z.ZodOptional<z.ZodObject<{
            fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
            layout: z.ZodOptional<z.ZodObject<{
                row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
            }, z.core.$strip>>;
            hAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
            vAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
        }, z.core.$strip>>>;
        tablet: z.ZodOptional<z.ZodOptional<z.ZodObject<{
            fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
            layout: z.ZodOptional<z.ZodObject<{
                row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
            }, z.core.$strip>>;
            hAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
            vAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
        }, z.core.$strip>>>;
        desktop: z.ZodOptional<z.ZodOptional<z.ZodObject<{
            fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
            layout: z.ZodOptional<z.ZodObject<{
                row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
            }, z.core.$strip>>;
            hAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
            vAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
        }, z.core.$strip>>>;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export type BlockUpdate = z.infer<typeof BlockUpdateSchema>;
export declare const DirectoryMetaSchema: z.ZodObject<{
    directory: z.ZodNullable<z.ZodString>;
    itemCount: z.ZodNumber;
    lastUploaded: z.ZodNullable<z.ZodString>;
}, z.core.$strip>;
export type DirectoryMeta = z.infer<typeof DirectoryMetaSchema>;
export declare const PageMetaSchema: z.ZodCatch<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
export type PageMeta = z.infer<typeof PageMetaSchema>;
export declare const PageStatusSchema: z.ZodEnum<{
    draft: "draft";
    published: "published";
}>;
export type PageStatus = z.infer<typeof PageStatusSchema>;
export declare const PageSchema: z.ZodObject<{
    id: z.ZodString;
    slug: z.ZodString;
    status: z.ZodEnum<{
        draft: "draft";
        published: "published";
    }>;
    title: z.ZodString;
    blocks: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
        id: z.ZodString;
        layout: z.ZodObject<{
            row: z.ZodCoercedNumber<unknown>;
            colStart: z.ZodCoercedNumber<unknown>;
            colSpan: z.ZodCoercedNumber<unknown>;
            rowSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
        }, z.core.$strip>;
        fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
        hAlign: z.ZodEnum<{
            "flex-start": "flex-start";
            center: "center";
            "flex-end": "flex-end";
        }>;
        vAlign: z.ZodEnum<{
            "flex-start": "flex-start";
            center: "center";
            "flex-end": "flex-end";
        }>;
        responsive: z.ZodOptional<z.ZodObject<{
            mobile: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                layout: z.ZodOptional<z.ZodObject<{
                    row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                }, z.core.$strip>>;
                hAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
                vAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
            }, z.core.$strip>>>;
            tablet: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                layout: z.ZodOptional<z.ZodObject<{
                    row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                }, z.core.$strip>>;
                hAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
                vAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
            }, z.core.$strip>>>;
            desktop: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                layout: z.ZodOptional<z.ZodObject<{
                    row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                }, z.core.$strip>>;
                hAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
                vAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
            }, z.core.$strip>>>;
        }, z.core.$strip>>;
        type: z.ZodLiteral<"title">;
        text: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        id: z.ZodString;
        layout: z.ZodObject<{
            row: z.ZodCoercedNumber<unknown>;
            colStart: z.ZodCoercedNumber<unknown>;
            colSpan: z.ZodCoercedNumber<unknown>;
            rowSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
        }, z.core.$strip>;
        fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
        hAlign: z.ZodEnum<{
            "flex-start": "flex-start";
            center: "center";
            "flex-end": "flex-end";
        }>;
        vAlign: z.ZodEnum<{
            "flex-start": "flex-start";
            center: "center";
            "flex-end": "flex-end";
        }>;
        responsive: z.ZodOptional<z.ZodObject<{
            mobile: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                layout: z.ZodOptional<z.ZodObject<{
                    row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                }, z.core.$strip>>;
                hAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
                vAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
            }, z.core.$strip>>>;
            tablet: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                layout: z.ZodOptional<z.ZodObject<{
                    row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                }, z.core.$strip>>;
                hAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
                vAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
            }, z.core.$strip>>>;
            desktop: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                layout: z.ZodOptional<z.ZodObject<{
                    row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                }, z.core.$strip>>;
                hAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
                vAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
            }, z.core.$strip>>>;
        }, z.core.$strip>>;
        type: z.ZodLiteral<"byline">;
        author: z.ZodString;
        publishedAt: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>, z.ZodObject<{
        id: z.ZodString;
        layout: z.ZodObject<{
            row: z.ZodCoercedNumber<unknown>;
            colStart: z.ZodCoercedNumber<unknown>;
            colSpan: z.ZodCoercedNumber<unknown>;
            rowSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
        }, z.core.$strip>;
        fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
        hAlign: z.ZodEnum<{
            "flex-start": "flex-start";
            center: "center";
            "flex-end": "flex-end";
        }>;
        vAlign: z.ZodEnum<{
            "flex-start": "flex-start";
            center: "center";
            "flex-end": "flex-end";
        }>;
        responsive: z.ZodOptional<z.ZodObject<{
            mobile: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                layout: z.ZodOptional<z.ZodObject<{
                    row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                }, z.core.$strip>>;
                hAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
                vAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
            }, z.core.$strip>>>;
            tablet: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                layout: z.ZodOptional<z.ZodObject<{
                    row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                }, z.core.$strip>>;
                hAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
                vAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
            }, z.core.$strip>>>;
            desktop: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                layout: z.ZodOptional<z.ZodObject<{
                    row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                }, z.core.$strip>>;
                hAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
                vAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
            }, z.core.$strip>>>;
        }, z.core.$strip>>;
        type: z.ZodLiteral<"text">;
        text: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        id: z.ZodString;
        layout: z.ZodObject<{
            row: z.ZodCoercedNumber<unknown>;
            colStart: z.ZodCoercedNumber<unknown>;
            colSpan: z.ZodCoercedNumber<unknown>;
            rowSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
        }, z.core.$strip>;
        fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
        hAlign: z.ZodEnum<{
            "flex-start": "flex-start";
            center: "center";
            "flex-end": "flex-end";
        }>;
        vAlign: z.ZodEnum<{
            "flex-start": "flex-start";
            center: "center";
            "flex-end": "flex-end";
        }>;
        responsive: z.ZodOptional<z.ZodObject<{
            mobile: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                layout: z.ZodOptional<z.ZodObject<{
                    row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                }, z.core.$strip>>;
                hAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
                vAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
            }, z.core.$strip>>>;
            tablet: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                layout: z.ZodOptional<z.ZodObject<{
                    row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                }, z.core.$strip>>;
                hAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
                vAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
            }, z.core.$strip>>>;
            desktop: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                layout: z.ZodOptional<z.ZodObject<{
                    row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                }, z.core.$strip>>;
                hAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
                vAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
            }, z.core.$strip>>>;
        }, z.core.$strip>>;
        type: z.ZodLiteral<"image">;
        src: z.ZodString;
        alt: z.ZodOptional<z.ZodString>;
        mediaHandle: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        imageStyle: z.ZodOptional<z.ZodObject<{
            columns: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
        }, z.core.$strict>>;
    }, z.core.$strip>, z.ZodObject<{
        id: z.ZodString;
        layout: z.ZodObject<{
            row: z.ZodCoercedNumber<unknown>;
            colStart: z.ZodCoercedNumber<unknown>;
            colSpan: z.ZodCoercedNumber<unknown>;
            rowSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
        }, z.core.$strip>;
        fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
        hAlign: z.ZodEnum<{
            "flex-start": "flex-start";
            center: "center";
            "flex-end": "flex-end";
        }>;
        vAlign: z.ZodEnum<{
            "flex-start": "flex-start";
            center: "center";
            "flex-end": "flex-end";
        }>;
        responsive: z.ZodOptional<z.ZodObject<{
            mobile: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                layout: z.ZodOptional<z.ZodObject<{
                    row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                }, z.core.$strip>>;
                hAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
                vAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
            }, z.core.$strip>>>;
            tablet: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                layout: z.ZodOptional<z.ZodObject<{
                    row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                }, z.core.$strip>>;
                hAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
                vAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
            }, z.core.$strip>>>;
            desktop: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                layout: z.ZodOptional<z.ZodObject<{
                    row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                }, z.core.$strip>>;
                hAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
                vAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
            }, z.core.$strip>>>;
        }, z.core.$strip>>;
        type: z.ZodLiteral<"background">;
        src: z.ZodOptional<z.ZodString>;
        color: z.ZodOptional<z.ZodString>;
        mediaHandle: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        bgStyle: z.ZodDefault<z.ZodEnum<{
            stretch: "stretch";
            tile: "tile";
        }>>;
    }, z.core.$strip>], "type">>;
    meta: z.ZodOptional<z.ZodCatch<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
    createdBy: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    publishedAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export type Page = z.infer<typeof PageSchema>;
export declare const PageWriteSchema: z.ZodObject<{
    title: z.ZodString;
    status: z.ZodOptional<z.ZodEnum<{
        draft: "draft";
        published: "published";
    }>>;
    blocks: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
        id: z.ZodString;
        layout: z.ZodObject<{
            row: z.ZodCoercedNumber<unknown>;
            colStart: z.ZodCoercedNumber<unknown>;
            colSpan: z.ZodCoercedNumber<unknown>;
            rowSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
        }, z.core.$strip>;
        fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
        hAlign: z.ZodEnum<{
            "flex-start": "flex-start";
            center: "center";
            "flex-end": "flex-end";
        }>;
        vAlign: z.ZodEnum<{
            "flex-start": "flex-start";
            center: "center";
            "flex-end": "flex-end";
        }>;
        responsive: z.ZodOptional<z.ZodObject<{
            mobile: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                layout: z.ZodOptional<z.ZodObject<{
                    row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                }, z.core.$strip>>;
                hAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
                vAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
            }, z.core.$strip>>>;
            tablet: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                layout: z.ZodOptional<z.ZodObject<{
                    row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                }, z.core.$strip>>;
                hAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
                vAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
            }, z.core.$strip>>>;
            desktop: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                layout: z.ZodOptional<z.ZodObject<{
                    row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                }, z.core.$strip>>;
                hAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
                vAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
            }, z.core.$strip>>>;
        }, z.core.$strip>>;
        type: z.ZodLiteral<"title">;
        text: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        id: z.ZodString;
        layout: z.ZodObject<{
            row: z.ZodCoercedNumber<unknown>;
            colStart: z.ZodCoercedNumber<unknown>;
            colSpan: z.ZodCoercedNumber<unknown>;
            rowSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
        }, z.core.$strip>;
        fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
        hAlign: z.ZodEnum<{
            "flex-start": "flex-start";
            center: "center";
            "flex-end": "flex-end";
        }>;
        vAlign: z.ZodEnum<{
            "flex-start": "flex-start";
            center: "center";
            "flex-end": "flex-end";
        }>;
        responsive: z.ZodOptional<z.ZodObject<{
            mobile: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                layout: z.ZodOptional<z.ZodObject<{
                    row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                }, z.core.$strip>>;
                hAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
                vAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
            }, z.core.$strip>>>;
            tablet: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                layout: z.ZodOptional<z.ZodObject<{
                    row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                }, z.core.$strip>>;
                hAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
                vAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
            }, z.core.$strip>>>;
            desktop: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                layout: z.ZodOptional<z.ZodObject<{
                    row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                }, z.core.$strip>>;
                hAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
                vAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
            }, z.core.$strip>>>;
        }, z.core.$strip>>;
        type: z.ZodLiteral<"byline">;
        author: z.ZodString;
        publishedAt: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>, z.ZodObject<{
        id: z.ZodString;
        layout: z.ZodObject<{
            row: z.ZodCoercedNumber<unknown>;
            colStart: z.ZodCoercedNumber<unknown>;
            colSpan: z.ZodCoercedNumber<unknown>;
            rowSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
        }, z.core.$strip>;
        fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
        hAlign: z.ZodEnum<{
            "flex-start": "flex-start";
            center: "center";
            "flex-end": "flex-end";
        }>;
        vAlign: z.ZodEnum<{
            "flex-start": "flex-start";
            center: "center";
            "flex-end": "flex-end";
        }>;
        responsive: z.ZodOptional<z.ZodObject<{
            mobile: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                layout: z.ZodOptional<z.ZodObject<{
                    row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                }, z.core.$strip>>;
                hAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
                vAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
            }, z.core.$strip>>>;
            tablet: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                layout: z.ZodOptional<z.ZodObject<{
                    row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                }, z.core.$strip>>;
                hAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
                vAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
            }, z.core.$strip>>>;
            desktop: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                layout: z.ZodOptional<z.ZodObject<{
                    row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                }, z.core.$strip>>;
                hAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
                vAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
            }, z.core.$strip>>>;
        }, z.core.$strip>>;
        type: z.ZodLiteral<"text">;
        text: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        id: z.ZodString;
        layout: z.ZodObject<{
            row: z.ZodCoercedNumber<unknown>;
            colStart: z.ZodCoercedNumber<unknown>;
            colSpan: z.ZodCoercedNumber<unknown>;
            rowSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
        }, z.core.$strip>;
        fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
        hAlign: z.ZodEnum<{
            "flex-start": "flex-start";
            center: "center";
            "flex-end": "flex-end";
        }>;
        vAlign: z.ZodEnum<{
            "flex-start": "flex-start";
            center: "center";
            "flex-end": "flex-end";
        }>;
        responsive: z.ZodOptional<z.ZodObject<{
            mobile: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                layout: z.ZodOptional<z.ZodObject<{
                    row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                }, z.core.$strip>>;
                hAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
                vAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
            }, z.core.$strip>>>;
            tablet: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                layout: z.ZodOptional<z.ZodObject<{
                    row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                }, z.core.$strip>>;
                hAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
                vAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
            }, z.core.$strip>>>;
            desktop: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                layout: z.ZodOptional<z.ZodObject<{
                    row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                }, z.core.$strip>>;
                hAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
                vAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
            }, z.core.$strip>>>;
        }, z.core.$strip>>;
        type: z.ZodLiteral<"image">;
        src: z.ZodString;
        alt: z.ZodOptional<z.ZodString>;
        mediaHandle: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        imageStyle: z.ZodOptional<z.ZodObject<{
            columns: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
        }, z.core.$strict>>;
    }, z.core.$strip>, z.ZodObject<{
        id: z.ZodString;
        layout: z.ZodObject<{
            row: z.ZodCoercedNumber<unknown>;
            colStart: z.ZodCoercedNumber<unknown>;
            colSpan: z.ZodCoercedNumber<unknown>;
            rowSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
        }, z.core.$strip>;
        fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
        hAlign: z.ZodEnum<{
            "flex-start": "flex-start";
            center: "center";
            "flex-end": "flex-end";
        }>;
        vAlign: z.ZodEnum<{
            "flex-start": "flex-start";
            center: "center";
            "flex-end": "flex-end";
        }>;
        responsive: z.ZodOptional<z.ZodObject<{
            mobile: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                layout: z.ZodOptional<z.ZodObject<{
                    row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                }, z.core.$strip>>;
                hAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
                vAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
            }, z.core.$strip>>>;
            tablet: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                layout: z.ZodOptional<z.ZodObject<{
                    row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                }, z.core.$strip>>;
                hAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
                vAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
            }, z.core.$strip>>>;
            desktop: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                layout: z.ZodOptional<z.ZodObject<{
                    row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                }, z.core.$strip>>;
                hAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
                vAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
            }, z.core.$strip>>>;
        }, z.core.$strip>>;
        type: z.ZodLiteral<"background">;
        src: z.ZodOptional<z.ZodString>;
        color: z.ZodOptional<z.ZodString>;
        mediaHandle: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        bgStyle: z.ZodDefault<z.ZodEnum<{
            stretch: "stretch";
            tile: "tile";
        }>>;
    }, z.core.$strip>], "type">>;
    meta: z.ZodOptional<z.ZodCatch<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
    publishedAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    createdBy: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    slug: z.ZodString;
}, z.core.$strip>;
export type PageWrite = z.infer<typeof PageWriteSchema>;
export declare const PageUpdateSchema: z.ZodObject<{
    title: z.ZodString;
    status: z.ZodOptional<z.ZodEnum<{
        draft: "draft";
        published: "published";
    }>>;
    blocks: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
        id: z.ZodString;
        layout: z.ZodObject<{
            row: z.ZodCoercedNumber<unknown>;
            colStart: z.ZodCoercedNumber<unknown>;
            colSpan: z.ZodCoercedNumber<unknown>;
            rowSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
        }, z.core.$strip>;
        fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
        hAlign: z.ZodEnum<{
            "flex-start": "flex-start";
            center: "center";
            "flex-end": "flex-end";
        }>;
        vAlign: z.ZodEnum<{
            "flex-start": "flex-start";
            center: "center";
            "flex-end": "flex-end";
        }>;
        responsive: z.ZodOptional<z.ZodObject<{
            mobile: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                layout: z.ZodOptional<z.ZodObject<{
                    row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                }, z.core.$strip>>;
                hAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
                vAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
            }, z.core.$strip>>>;
            tablet: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                layout: z.ZodOptional<z.ZodObject<{
                    row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                }, z.core.$strip>>;
                hAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
                vAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
            }, z.core.$strip>>>;
            desktop: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                layout: z.ZodOptional<z.ZodObject<{
                    row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                }, z.core.$strip>>;
                hAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
                vAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
            }, z.core.$strip>>>;
        }, z.core.$strip>>;
        type: z.ZodLiteral<"title">;
        text: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        id: z.ZodString;
        layout: z.ZodObject<{
            row: z.ZodCoercedNumber<unknown>;
            colStart: z.ZodCoercedNumber<unknown>;
            colSpan: z.ZodCoercedNumber<unknown>;
            rowSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
        }, z.core.$strip>;
        fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
        hAlign: z.ZodEnum<{
            "flex-start": "flex-start";
            center: "center";
            "flex-end": "flex-end";
        }>;
        vAlign: z.ZodEnum<{
            "flex-start": "flex-start";
            center: "center";
            "flex-end": "flex-end";
        }>;
        responsive: z.ZodOptional<z.ZodObject<{
            mobile: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                layout: z.ZodOptional<z.ZodObject<{
                    row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                }, z.core.$strip>>;
                hAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
                vAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
            }, z.core.$strip>>>;
            tablet: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                layout: z.ZodOptional<z.ZodObject<{
                    row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                }, z.core.$strip>>;
                hAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
                vAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
            }, z.core.$strip>>>;
            desktop: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                layout: z.ZodOptional<z.ZodObject<{
                    row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                }, z.core.$strip>>;
                hAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
                vAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
            }, z.core.$strip>>>;
        }, z.core.$strip>>;
        type: z.ZodLiteral<"byline">;
        author: z.ZodString;
        publishedAt: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>, z.ZodObject<{
        id: z.ZodString;
        layout: z.ZodObject<{
            row: z.ZodCoercedNumber<unknown>;
            colStart: z.ZodCoercedNumber<unknown>;
            colSpan: z.ZodCoercedNumber<unknown>;
            rowSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
        }, z.core.$strip>;
        fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
        hAlign: z.ZodEnum<{
            "flex-start": "flex-start";
            center: "center";
            "flex-end": "flex-end";
        }>;
        vAlign: z.ZodEnum<{
            "flex-start": "flex-start";
            center: "center";
            "flex-end": "flex-end";
        }>;
        responsive: z.ZodOptional<z.ZodObject<{
            mobile: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                layout: z.ZodOptional<z.ZodObject<{
                    row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                }, z.core.$strip>>;
                hAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
                vAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
            }, z.core.$strip>>>;
            tablet: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                layout: z.ZodOptional<z.ZodObject<{
                    row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                }, z.core.$strip>>;
                hAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
                vAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
            }, z.core.$strip>>>;
            desktop: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                layout: z.ZodOptional<z.ZodObject<{
                    row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                }, z.core.$strip>>;
                hAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
                vAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
            }, z.core.$strip>>>;
        }, z.core.$strip>>;
        type: z.ZodLiteral<"text">;
        text: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        id: z.ZodString;
        layout: z.ZodObject<{
            row: z.ZodCoercedNumber<unknown>;
            colStart: z.ZodCoercedNumber<unknown>;
            colSpan: z.ZodCoercedNumber<unknown>;
            rowSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
        }, z.core.$strip>;
        fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
        hAlign: z.ZodEnum<{
            "flex-start": "flex-start";
            center: "center";
            "flex-end": "flex-end";
        }>;
        vAlign: z.ZodEnum<{
            "flex-start": "flex-start";
            center: "center";
            "flex-end": "flex-end";
        }>;
        responsive: z.ZodOptional<z.ZodObject<{
            mobile: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                layout: z.ZodOptional<z.ZodObject<{
                    row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                }, z.core.$strip>>;
                hAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
                vAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
            }, z.core.$strip>>>;
            tablet: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                layout: z.ZodOptional<z.ZodObject<{
                    row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                }, z.core.$strip>>;
                hAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
                vAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
            }, z.core.$strip>>>;
            desktop: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                layout: z.ZodOptional<z.ZodObject<{
                    row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                }, z.core.$strip>>;
                hAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
                vAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
            }, z.core.$strip>>>;
        }, z.core.$strip>>;
        type: z.ZodLiteral<"image">;
        src: z.ZodString;
        alt: z.ZodOptional<z.ZodString>;
        mediaHandle: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        imageStyle: z.ZodOptional<z.ZodObject<{
            columns: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
        }, z.core.$strict>>;
    }, z.core.$strip>, z.ZodObject<{
        id: z.ZodString;
        layout: z.ZodObject<{
            row: z.ZodCoercedNumber<unknown>;
            colStart: z.ZodCoercedNumber<unknown>;
            colSpan: z.ZodCoercedNumber<unknown>;
            rowSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
        }, z.core.$strip>;
        fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
        hAlign: z.ZodEnum<{
            "flex-start": "flex-start";
            center: "center";
            "flex-end": "flex-end";
        }>;
        vAlign: z.ZodEnum<{
            "flex-start": "flex-start";
            center: "center";
            "flex-end": "flex-end";
        }>;
        responsive: z.ZodOptional<z.ZodObject<{
            mobile: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                layout: z.ZodOptional<z.ZodObject<{
                    row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                }, z.core.$strip>>;
                hAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
                vAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
            }, z.core.$strip>>>;
            tablet: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                layout: z.ZodOptional<z.ZodObject<{
                    row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                }, z.core.$strip>>;
                hAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
                vAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
            }, z.core.$strip>>>;
            desktop: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                layout: z.ZodOptional<z.ZodObject<{
                    row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                }, z.core.$strip>>;
                hAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
                vAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
            }, z.core.$strip>>>;
        }, z.core.$strip>>;
        type: z.ZodLiteral<"background">;
        src: z.ZodOptional<z.ZodString>;
        color: z.ZodOptional<z.ZodString>;
        mediaHandle: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        bgStyle: z.ZodDefault<z.ZodEnum<{
            stretch: "stretch";
            tile: "tile";
        }>>;
    }, z.core.$strip>], "type">>;
    meta: z.ZodOptional<z.ZodCatch<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
    publishedAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    createdBy: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    slug: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type PageUpdate = z.infer<typeof PageUpdateSchema>;
export declare const PageSummarySchema: z.ZodObject<{
    page: z.ZodObject<{
        id: z.ZodString;
        slug: z.ZodString;
        status: z.ZodEnum<{
            draft: "draft";
            published: "published";
        }>;
        title: z.ZodString;
        blocks: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
            id: z.ZodString;
            layout: z.ZodObject<{
                row: z.ZodCoercedNumber<unknown>;
                colStart: z.ZodCoercedNumber<unknown>;
                colSpan: z.ZodCoercedNumber<unknown>;
                rowSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
            }, z.core.$strip>;
            fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
            hAlign: z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>;
            vAlign: z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>;
            responsive: z.ZodOptional<z.ZodObject<{
                mobile: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                    fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                    layout: z.ZodOptional<z.ZodObject<{
                        row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                        colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                        colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                        rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                    }, z.core.$strip>>;
                    hAlign: z.ZodOptional<z.ZodEnum<{
                        "flex-start": "flex-start";
                        center: "center";
                        "flex-end": "flex-end";
                    }>>;
                    vAlign: z.ZodOptional<z.ZodEnum<{
                        "flex-start": "flex-start";
                        center: "center";
                        "flex-end": "flex-end";
                    }>>;
                }, z.core.$strip>>>;
                tablet: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                    fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                    layout: z.ZodOptional<z.ZodObject<{
                        row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                        colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                        colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                        rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                    }, z.core.$strip>>;
                    hAlign: z.ZodOptional<z.ZodEnum<{
                        "flex-start": "flex-start";
                        center: "center";
                        "flex-end": "flex-end";
                    }>>;
                    vAlign: z.ZodOptional<z.ZodEnum<{
                        "flex-start": "flex-start";
                        center: "center";
                        "flex-end": "flex-end";
                    }>>;
                }, z.core.$strip>>>;
                desktop: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                    fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                    layout: z.ZodOptional<z.ZodObject<{
                        row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                        colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                        colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                        rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                    }, z.core.$strip>>;
                    hAlign: z.ZodOptional<z.ZodEnum<{
                        "flex-start": "flex-start";
                        center: "center";
                        "flex-end": "flex-end";
                    }>>;
                    vAlign: z.ZodOptional<z.ZodEnum<{
                        "flex-start": "flex-start";
                        center: "center";
                        "flex-end": "flex-end";
                    }>>;
                }, z.core.$strip>>>;
            }, z.core.$strip>>;
            type: z.ZodLiteral<"title">;
            text: z.ZodString;
        }, z.core.$strip>, z.ZodObject<{
            id: z.ZodString;
            layout: z.ZodObject<{
                row: z.ZodCoercedNumber<unknown>;
                colStart: z.ZodCoercedNumber<unknown>;
                colSpan: z.ZodCoercedNumber<unknown>;
                rowSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
            }, z.core.$strip>;
            fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
            hAlign: z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>;
            vAlign: z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>;
            responsive: z.ZodOptional<z.ZodObject<{
                mobile: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                    fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                    layout: z.ZodOptional<z.ZodObject<{
                        row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                        colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                        colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                        rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                    }, z.core.$strip>>;
                    hAlign: z.ZodOptional<z.ZodEnum<{
                        "flex-start": "flex-start";
                        center: "center";
                        "flex-end": "flex-end";
                    }>>;
                    vAlign: z.ZodOptional<z.ZodEnum<{
                        "flex-start": "flex-start";
                        center: "center";
                        "flex-end": "flex-end";
                    }>>;
                }, z.core.$strip>>>;
                tablet: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                    fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                    layout: z.ZodOptional<z.ZodObject<{
                        row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                        colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                        colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                        rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                    }, z.core.$strip>>;
                    hAlign: z.ZodOptional<z.ZodEnum<{
                        "flex-start": "flex-start";
                        center: "center";
                        "flex-end": "flex-end";
                    }>>;
                    vAlign: z.ZodOptional<z.ZodEnum<{
                        "flex-start": "flex-start";
                        center: "center";
                        "flex-end": "flex-end";
                    }>>;
                }, z.core.$strip>>>;
                desktop: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                    fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                    layout: z.ZodOptional<z.ZodObject<{
                        row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                        colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                        colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                        rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                    }, z.core.$strip>>;
                    hAlign: z.ZodOptional<z.ZodEnum<{
                        "flex-start": "flex-start";
                        center: "center";
                        "flex-end": "flex-end";
                    }>>;
                    vAlign: z.ZodOptional<z.ZodEnum<{
                        "flex-start": "flex-start";
                        center: "center";
                        "flex-end": "flex-end";
                    }>>;
                }, z.core.$strip>>>;
            }, z.core.$strip>>;
            type: z.ZodLiteral<"byline">;
            author: z.ZodString;
            publishedAt: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>, z.ZodObject<{
            id: z.ZodString;
            layout: z.ZodObject<{
                row: z.ZodCoercedNumber<unknown>;
                colStart: z.ZodCoercedNumber<unknown>;
                colSpan: z.ZodCoercedNumber<unknown>;
                rowSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
            }, z.core.$strip>;
            fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
            hAlign: z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>;
            vAlign: z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>;
            responsive: z.ZodOptional<z.ZodObject<{
                mobile: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                    fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                    layout: z.ZodOptional<z.ZodObject<{
                        row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                        colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                        colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                        rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                    }, z.core.$strip>>;
                    hAlign: z.ZodOptional<z.ZodEnum<{
                        "flex-start": "flex-start";
                        center: "center";
                        "flex-end": "flex-end";
                    }>>;
                    vAlign: z.ZodOptional<z.ZodEnum<{
                        "flex-start": "flex-start";
                        center: "center";
                        "flex-end": "flex-end";
                    }>>;
                }, z.core.$strip>>>;
                tablet: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                    fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                    layout: z.ZodOptional<z.ZodObject<{
                        row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                        colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                        colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                        rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                    }, z.core.$strip>>;
                    hAlign: z.ZodOptional<z.ZodEnum<{
                        "flex-start": "flex-start";
                        center: "center";
                        "flex-end": "flex-end";
                    }>>;
                    vAlign: z.ZodOptional<z.ZodEnum<{
                        "flex-start": "flex-start";
                        center: "center";
                        "flex-end": "flex-end";
                    }>>;
                }, z.core.$strip>>>;
                desktop: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                    fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                    layout: z.ZodOptional<z.ZodObject<{
                        row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                        colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                        colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                        rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                    }, z.core.$strip>>;
                    hAlign: z.ZodOptional<z.ZodEnum<{
                        "flex-start": "flex-start";
                        center: "center";
                        "flex-end": "flex-end";
                    }>>;
                    vAlign: z.ZodOptional<z.ZodEnum<{
                        "flex-start": "flex-start";
                        center: "center";
                        "flex-end": "flex-end";
                    }>>;
                }, z.core.$strip>>>;
            }, z.core.$strip>>;
            type: z.ZodLiteral<"text">;
            text: z.ZodString;
        }, z.core.$strip>, z.ZodObject<{
            id: z.ZodString;
            layout: z.ZodObject<{
                row: z.ZodCoercedNumber<unknown>;
                colStart: z.ZodCoercedNumber<unknown>;
                colSpan: z.ZodCoercedNumber<unknown>;
                rowSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
            }, z.core.$strip>;
            fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
            hAlign: z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>;
            vAlign: z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>;
            responsive: z.ZodOptional<z.ZodObject<{
                mobile: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                    fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                    layout: z.ZodOptional<z.ZodObject<{
                        row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                        colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                        colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                        rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                    }, z.core.$strip>>;
                    hAlign: z.ZodOptional<z.ZodEnum<{
                        "flex-start": "flex-start";
                        center: "center";
                        "flex-end": "flex-end";
                    }>>;
                    vAlign: z.ZodOptional<z.ZodEnum<{
                        "flex-start": "flex-start";
                        center: "center";
                        "flex-end": "flex-end";
                    }>>;
                }, z.core.$strip>>>;
                tablet: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                    fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                    layout: z.ZodOptional<z.ZodObject<{
                        row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                        colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                        colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                        rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                    }, z.core.$strip>>;
                    hAlign: z.ZodOptional<z.ZodEnum<{
                        "flex-start": "flex-start";
                        center: "center";
                        "flex-end": "flex-end";
                    }>>;
                    vAlign: z.ZodOptional<z.ZodEnum<{
                        "flex-start": "flex-start";
                        center: "center";
                        "flex-end": "flex-end";
                    }>>;
                }, z.core.$strip>>>;
                desktop: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                    fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                    layout: z.ZodOptional<z.ZodObject<{
                        row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                        colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                        colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                        rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                    }, z.core.$strip>>;
                    hAlign: z.ZodOptional<z.ZodEnum<{
                        "flex-start": "flex-start";
                        center: "center";
                        "flex-end": "flex-end";
                    }>>;
                    vAlign: z.ZodOptional<z.ZodEnum<{
                        "flex-start": "flex-start";
                        center: "center";
                        "flex-end": "flex-end";
                    }>>;
                }, z.core.$strip>>>;
            }, z.core.$strip>>;
            type: z.ZodLiteral<"image">;
            src: z.ZodString;
            alt: z.ZodOptional<z.ZodString>;
            mediaHandle: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            imageStyle: z.ZodOptional<z.ZodObject<{
                columns: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
            }, z.core.$strict>>;
        }, z.core.$strip>, z.ZodObject<{
            id: z.ZodString;
            layout: z.ZodObject<{
                row: z.ZodCoercedNumber<unknown>;
                colStart: z.ZodCoercedNumber<unknown>;
                colSpan: z.ZodCoercedNumber<unknown>;
                rowSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
            }, z.core.$strip>;
            fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
            hAlign: z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>;
            vAlign: z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>;
            responsive: z.ZodOptional<z.ZodObject<{
                mobile: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                    fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                    layout: z.ZodOptional<z.ZodObject<{
                        row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                        colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                        colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                        rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                    }, z.core.$strip>>;
                    hAlign: z.ZodOptional<z.ZodEnum<{
                        "flex-start": "flex-start";
                        center: "center";
                        "flex-end": "flex-end";
                    }>>;
                    vAlign: z.ZodOptional<z.ZodEnum<{
                        "flex-start": "flex-start";
                        center: "center";
                        "flex-end": "flex-end";
                    }>>;
                }, z.core.$strip>>>;
                tablet: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                    fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                    layout: z.ZodOptional<z.ZodObject<{
                        row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                        colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                        colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                        rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                    }, z.core.$strip>>;
                    hAlign: z.ZodOptional<z.ZodEnum<{
                        "flex-start": "flex-start";
                        center: "center";
                        "flex-end": "flex-end";
                    }>>;
                    vAlign: z.ZodOptional<z.ZodEnum<{
                        "flex-start": "flex-start";
                        center: "center";
                        "flex-end": "flex-end";
                    }>>;
                }, z.core.$strip>>>;
                desktop: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                    fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                    layout: z.ZodOptional<z.ZodObject<{
                        row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                        colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                        colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                        rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                    }, z.core.$strip>>;
                    hAlign: z.ZodOptional<z.ZodEnum<{
                        "flex-start": "flex-start";
                        center: "center";
                        "flex-end": "flex-end";
                    }>>;
                    vAlign: z.ZodOptional<z.ZodEnum<{
                        "flex-start": "flex-start";
                        center: "center";
                        "flex-end": "flex-end";
                    }>>;
                }, z.core.$strip>>>;
            }, z.core.$strip>>;
            type: z.ZodLiteral<"background">;
            src: z.ZodOptional<z.ZodString>;
            color: z.ZodOptional<z.ZodString>;
            mediaHandle: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            bgStyle: z.ZodDefault<z.ZodEnum<{
                stretch: "stretch";
                tile: "tile";
            }>>;
        }, z.core.$strip>], "type">>;
        meta: z.ZodOptional<z.ZodCatch<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
        createdBy: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
        publishedAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export type PageSummary = z.infer<typeof PageSummarySchema>;
export declare const PageDetailSchema: z.ZodObject<{
    page: z.ZodObject<{
        id: z.ZodString;
        slug: z.ZodString;
        status: z.ZodEnum<{
            draft: "draft";
            published: "published";
        }>;
        title: z.ZodString;
        blocks: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
            id: z.ZodString;
            layout: z.ZodObject<{
                row: z.ZodCoercedNumber<unknown>;
                colStart: z.ZodCoercedNumber<unknown>;
                colSpan: z.ZodCoercedNumber<unknown>;
                rowSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
            }, z.core.$strip>;
            fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
            hAlign: z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>;
            vAlign: z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>;
            responsive: z.ZodOptional<z.ZodObject<{
                mobile: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                    fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                    layout: z.ZodOptional<z.ZodObject<{
                        row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                        colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                        colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                        rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                    }, z.core.$strip>>;
                    hAlign: z.ZodOptional<z.ZodEnum<{
                        "flex-start": "flex-start";
                        center: "center";
                        "flex-end": "flex-end";
                    }>>;
                    vAlign: z.ZodOptional<z.ZodEnum<{
                        "flex-start": "flex-start";
                        center: "center";
                        "flex-end": "flex-end";
                    }>>;
                }, z.core.$strip>>>;
                tablet: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                    fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                    layout: z.ZodOptional<z.ZodObject<{
                        row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                        colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                        colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                        rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                    }, z.core.$strip>>;
                    hAlign: z.ZodOptional<z.ZodEnum<{
                        "flex-start": "flex-start";
                        center: "center";
                        "flex-end": "flex-end";
                    }>>;
                    vAlign: z.ZodOptional<z.ZodEnum<{
                        "flex-start": "flex-start";
                        center: "center";
                        "flex-end": "flex-end";
                    }>>;
                }, z.core.$strip>>>;
                desktop: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                    fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                    layout: z.ZodOptional<z.ZodObject<{
                        row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                        colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                        colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                        rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                    }, z.core.$strip>>;
                    hAlign: z.ZodOptional<z.ZodEnum<{
                        "flex-start": "flex-start";
                        center: "center";
                        "flex-end": "flex-end";
                    }>>;
                    vAlign: z.ZodOptional<z.ZodEnum<{
                        "flex-start": "flex-start";
                        center: "center";
                        "flex-end": "flex-end";
                    }>>;
                }, z.core.$strip>>>;
            }, z.core.$strip>>;
            type: z.ZodLiteral<"title">;
            text: z.ZodString;
        }, z.core.$strip>, z.ZodObject<{
            id: z.ZodString;
            layout: z.ZodObject<{
                row: z.ZodCoercedNumber<unknown>;
                colStart: z.ZodCoercedNumber<unknown>;
                colSpan: z.ZodCoercedNumber<unknown>;
                rowSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
            }, z.core.$strip>;
            fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
            hAlign: z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>;
            vAlign: z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>;
            responsive: z.ZodOptional<z.ZodObject<{
                mobile: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                    fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                    layout: z.ZodOptional<z.ZodObject<{
                        row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                        colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                        colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                        rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                    }, z.core.$strip>>;
                    hAlign: z.ZodOptional<z.ZodEnum<{
                        "flex-start": "flex-start";
                        center: "center";
                        "flex-end": "flex-end";
                    }>>;
                    vAlign: z.ZodOptional<z.ZodEnum<{
                        "flex-start": "flex-start";
                        center: "center";
                        "flex-end": "flex-end";
                    }>>;
                }, z.core.$strip>>>;
                tablet: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                    fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                    layout: z.ZodOptional<z.ZodObject<{
                        row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                        colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                        colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                        rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                    }, z.core.$strip>>;
                    hAlign: z.ZodOptional<z.ZodEnum<{
                        "flex-start": "flex-start";
                        center: "center";
                        "flex-end": "flex-end";
                    }>>;
                    vAlign: z.ZodOptional<z.ZodEnum<{
                        "flex-start": "flex-start";
                        center: "center";
                        "flex-end": "flex-end";
                    }>>;
                }, z.core.$strip>>>;
                desktop: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                    fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                    layout: z.ZodOptional<z.ZodObject<{
                        row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                        colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                        colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                        rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                    }, z.core.$strip>>;
                    hAlign: z.ZodOptional<z.ZodEnum<{
                        "flex-start": "flex-start";
                        center: "center";
                        "flex-end": "flex-end";
                    }>>;
                    vAlign: z.ZodOptional<z.ZodEnum<{
                        "flex-start": "flex-start";
                        center: "center";
                        "flex-end": "flex-end";
                    }>>;
                }, z.core.$strip>>>;
            }, z.core.$strip>>;
            type: z.ZodLiteral<"byline">;
            author: z.ZodString;
            publishedAt: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>, z.ZodObject<{
            id: z.ZodString;
            layout: z.ZodObject<{
                row: z.ZodCoercedNumber<unknown>;
                colStart: z.ZodCoercedNumber<unknown>;
                colSpan: z.ZodCoercedNumber<unknown>;
                rowSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
            }, z.core.$strip>;
            fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
            hAlign: z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>;
            vAlign: z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>;
            responsive: z.ZodOptional<z.ZodObject<{
                mobile: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                    fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                    layout: z.ZodOptional<z.ZodObject<{
                        row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                        colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                        colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                        rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                    }, z.core.$strip>>;
                    hAlign: z.ZodOptional<z.ZodEnum<{
                        "flex-start": "flex-start";
                        center: "center";
                        "flex-end": "flex-end";
                    }>>;
                    vAlign: z.ZodOptional<z.ZodEnum<{
                        "flex-start": "flex-start";
                        center: "center";
                        "flex-end": "flex-end";
                    }>>;
                }, z.core.$strip>>>;
                tablet: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                    fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                    layout: z.ZodOptional<z.ZodObject<{
                        row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                        colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                        colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                        rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                    }, z.core.$strip>>;
                    hAlign: z.ZodOptional<z.ZodEnum<{
                        "flex-start": "flex-start";
                        center: "center";
                        "flex-end": "flex-end";
                    }>>;
                    vAlign: z.ZodOptional<z.ZodEnum<{
                        "flex-start": "flex-start";
                        center: "center";
                        "flex-end": "flex-end";
                    }>>;
                }, z.core.$strip>>>;
                desktop: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                    fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                    layout: z.ZodOptional<z.ZodObject<{
                        row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                        colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                        colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                        rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                    }, z.core.$strip>>;
                    hAlign: z.ZodOptional<z.ZodEnum<{
                        "flex-start": "flex-start";
                        center: "center";
                        "flex-end": "flex-end";
                    }>>;
                    vAlign: z.ZodOptional<z.ZodEnum<{
                        "flex-start": "flex-start";
                        center: "center";
                        "flex-end": "flex-end";
                    }>>;
                }, z.core.$strip>>>;
            }, z.core.$strip>>;
            type: z.ZodLiteral<"text">;
            text: z.ZodString;
        }, z.core.$strip>, z.ZodObject<{
            id: z.ZodString;
            layout: z.ZodObject<{
                row: z.ZodCoercedNumber<unknown>;
                colStart: z.ZodCoercedNumber<unknown>;
                colSpan: z.ZodCoercedNumber<unknown>;
                rowSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
            }, z.core.$strip>;
            fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
            hAlign: z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>;
            vAlign: z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>;
            responsive: z.ZodOptional<z.ZodObject<{
                mobile: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                    fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                    layout: z.ZodOptional<z.ZodObject<{
                        row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                        colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                        colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                        rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                    }, z.core.$strip>>;
                    hAlign: z.ZodOptional<z.ZodEnum<{
                        "flex-start": "flex-start";
                        center: "center";
                        "flex-end": "flex-end";
                    }>>;
                    vAlign: z.ZodOptional<z.ZodEnum<{
                        "flex-start": "flex-start";
                        center: "center";
                        "flex-end": "flex-end";
                    }>>;
                }, z.core.$strip>>>;
                tablet: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                    fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                    layout: z.ZodOptional<z.ZodObject<{
                        row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                        colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                        colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                        rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                    }, z.core.$strip>>;
                    hAlign: z.ZodOptional<z.ZodEnum<{
                        "flex-start": "flex-start";
                        center: "center";
                        "flex-end": "flex-end";
                    }>>;
                    vAlign: z.ZodOptional<z.ZodEnum<{
                        "flex-start": "flex-start";
                        center: "center";
                        "flex-end": "flex-end";
                    }>>;
                }, z.core.$strip>>>;
                desktop: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                    fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                    layout: z.ZodOptional<z.ZodObject<{
                        row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                        colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                        colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                        rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                    }, z.core.$strip>>;
                    hAlign: z.ZodOptional<z.ZodEnum<{
                        "flex-start": "flex-start";
                        center: "center";
                        "flex-end": "flex-end";
                    }>>;
                    vAlign: z.ZodOptional<z.ZodEnum<{
                        "flex-start": "flex-start";
                        center: "center";
                        "flex-end": "flex-end";
                    }>>;
                }, z.core.$strip>>>;
            }, z.core.$strip>>;
            type: z.ZodLiteral<"image">;
            src: z.ZodString;
            alt: z.ZodOptional<z.ZodString>;
            mediaHandle: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            imageStyle: z.ZodOptional<z.ZodObject<{
                columns: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
            }, z.core.$strict>>;
        }, z.core.$strip>, z.ZodObject<{
            id: z.ZodString;
            layout: z.ZodObject<{
                row: z.ZodCoercedNumber<unknown>;
                colStart: z.ZodCoercedNumber<unknown>;
                colSpan: z.ZodCoercedNumber<unknown>;
                rowSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
            }, z.core.$strip>;
            fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
            hAlign: z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>;
            vAlign: z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>;
            responsive: z.ZodOptional<z.ZodObject<{
                mobile: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                    fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                    layout: z.ZodOptional<z.ZodObject<{
                        row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                        colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                        colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                        rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                    }, z.core.$strip>>;
                    hAlign: z.ZodOptional<z.ZodEnum<{
                        "flex-start": "flex-start";
                        center: "center";
                        "flex-end": "flex-end";
                    }>>;
                    vAlign: z.ZodOptional<z.ZodEnum<{
                        "flex-start": "flex-start";
                        center: "center";
                        "flex-end": "flex-end";
                    }>>;
                }, z.core.$strip>>>;
                tablet: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                    fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                    layout: z.ZodOptional<z.ZodObject<{
                        row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                        colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                        colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                        rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                    }, z.core.$strip>>;
                    hAlign: z.ZodOptional<z.ZodEnum<{
                        "flex-start": "flex-start";
                        center: "center";
                        "flex-end": "flex-end";
                    }>>;
                    vAlign: z.ZodOptional<z.ZodEnum<{
                        "flex-start": "flex-start";
                        center: "center";
                        "flex-end": "flex-end";
                    }>>;
                }, z.core.$strip>>>;
                desktop: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                    fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                    layout: z.ZodOptional<z.ZodObject<{
                        row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                        colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                        colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                        rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                    }, z.core.$strip>>;
                    hAlign: z.ZodOptional<z.ZodEnum<{
                        "flex-start": "flex-start";
                        center: "center";
                        "flex-end": "flex-end";
                    }>>;
                    vAlign: z.ZodOptional<z.ZodEnum<{
                        "flex-start": "flex-start";
                        center: "center";
                        "flex-end": "flex-end";
                    }>>;
                }, z.core.$strip>>>;
            }, z.core.$strip>>;
            type: z.ZodLiteral<"background">;
            src: z.ZodOptional<z.ZodString>;
            color: z.ZodOptional<z.ZodString>;
            mediaHandle: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            bgStyle: z.ZodDefault<z.ZodEnum<{
                stretch: "stretch";
                tile: "tile";
            }>>;
        }, z.core.$strip>], "type">>;
        meta: z.ZodOptional<z.ZodCatch<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
        createdBy: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
        publishedAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export type PageDetail = z.infer<typeof PageDetailSchema>;
export declare const PageContentResponseSchema: z.ZodObject<{
    id: z.ZodString;
    slug: z.ZodString;
    title: z.ZodString;
    status: z.ZodEnum<{
        draft: "draft";
        published: "published";
    }>;
    updatedAt: z.ZodString;
    blocks: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
        id: z.ZodString;
        layout: z.ZodObject<{
            row: z.ZodCoercedNumber<unknown>;
            colStart: z.ZodCoercedNumber<unknown>;
            colSpan: z.ZodCoercedNumber<unknown>;
            rowSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
        }, z.core.$strip>;
        fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
        hAlign: z.ZodEnum<{
            "flex-start": "flex-start";
            center: "center";
            "flex-end": "flex-end";
        }>;
        vAlign: z.ZodEnum<{
            "flex-start": "flex-start";
            center: "center";
            "flex-end": "flex-end";
        }>;
        responsive: z.ZodOptional<z.ZodObject<{
            mobile: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                layout: z.ZodOptional<z.ZodObject<{
                    row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                }, z.core.$strip>>;
                hAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
                vAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
            }, z.core.$strip>>>;
            tablet: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                layout: z.ZodOptional<z.ZodObject<{
                    row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                }, z.core.$strip>>;
                hAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
                vAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
            }, z.core.$strip>>>;
            desktop: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                layout: z.ZodOptional<z.ZodObject<{
                    row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                }, z.core.$strip>>;
                hAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
                vAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
            }, z.core.$strip>>>;
        }, z.core.$strip>>;
        type: z.ZodLiteral<"title">;
        text: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        id: z.ZodString;
        layout: z.ZodObject<{
            row: z.ZodCoercedNumber<unknown>;
            colStart: z.ZodCoercedNumber<unknown>;
            colSpan: z.ZodCoercedNumber<unknown>;
            rowSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
        }, z.core.$strip>;
        fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
        hAlign: z.ZodEnum<{
            "flex-start": "flex-start";
            center: "center";
            "flex-end": "flex-end";
        }>;
        vAlign: z.ZodEnum<{
            "flex-start": "flex-start";
            center: "center";
            "flex-end": "flex-end";
        }>;
        responsive: z.ZodOptional<z.ZodObject<{
            mobile: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                layout: z.ZodOptional<z.ZodObject<{
                    row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                }, z.core.$strip>>;
                hAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
                vAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
            }, z.core.$strip>>>;
            tablet: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                layout: z.ZodOptional<z.ZodObject<{
                    row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                }, z.core.$strip>>;
                hAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
                vAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
            }, z.core.$strip>>>;
            desktop: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                layout: z.ZodOptional<z.ZodObject<{
                    row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                }, z.core.$strip>>;
                hAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
                vAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
            }, z.core.$strip>>>;
        }, z.core.$strip>>;
        type: z.ZodLiteral<"byline">;
        author: z.ZodString;
        publishedAt: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>, z.ZodObject<{
        id: z.ZodString;
        layout: z.ZodObject<{
            row: z.ZodCoercedNumber<unknown>;
            colStart: z.ZodCoercedNumber<unknown>;
            colSpan: z.ZodCoercedNumber<unknown>;
            rowSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
        }, z.core.$strip>;
        fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
        hAlign: z.ZodEnum<{
            "flex-start": "flex-start";
            center: "center";
            "flex-end": "flex-end";
        }>;
        vAlign: z.ZodEnum<{
            "flex-start": "flex-start";
            center: "center";
            "flex-end": "flex-end";
        }>;
        responsive: z.ZodOptional<z.ZodObject<{
            mobile: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                layout: z.ZodOptional<z.ZodObject<{
                    row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                }, z.core.$strip>>;
                hAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
                vAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
            }, z.core.$strip>>>;
            tablet: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                layout: z.ZodOptional<z.ZodObject<{
                    row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                }, z.core.$strip>>;
                hAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
                vAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
            }, z.core.$strip>>>;
            desktop: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                layout: z.ZodOptional<z.ZodObject<{
                    row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                }, z.core.$strip>>;
                hAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
                vAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
            }, z.core.$strip>>>;
        }, z.core.$strip>>;
        type: z.ZodLiteral<"text">;
        text: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        id: z.ZodString;
        layout: z.ZodObject<{
            row: z.ZodCoercedNumber<unknown>;
            colStart: z.ZodCoercedNumber<unknown>;
            colSpan: z.ZodCoercedNumber<unknown>;
            rowSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
        }, z.core.$strip>;
        fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
        hAlign: z.ZodEnum<{
            "flex-start": "flex-start";
            center: "center";
            "flex-end": "flex-end";
        }>;
        vAlign: z.ZodEnum<{
            "flex-start": "flex-start";
            center: "center";
            "flex-end": "flex-end";
        }>;
        responsive: z.ZodOptional<z.ZodObject<{
            mobile: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                layout: z.ZodOptional<z.ZodObject<{
                    row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                }, z.core.$strip>>;
                hAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
                vAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
            }, z.core.$strip>>>;
            tablet: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                layout: z.ZodOptional<z.ZodObject<{
                    row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                }, z.core.$strip>>;
                hAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
                vAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
            }, z.core.$strip>>>;
            desktop: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                layout: z.ZodOptional<z.ZodObject<{
                    row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                }, z.core.$strip>>;
                hAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
                vAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
            }, z.core.$strip>>>;
        }, z.core.$strip>>;
        type: z.ZodLiteral<"image">;
        src: z.ZodString;
        alt: z.ZodOptional<z.ZodString>;
        mediaHandle: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        imageStyle: z.ZodOptional<z.ZodObject<{
            columns: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
        }, z.core.$strict>>;
    }, z.core.$strip>, z.ZodObject<{
        id: z.ZodString;
        layout: z.ZodObject<{
            row: z.ZodCoercedNumber<unknown>;
            colStart: z.ZodCoercedNumber<unknown>;
            colSpan: z.ZodCoercedNumber<unknown>;
            rowSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
        }, z.core.$strip>;
        fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
        hAlign: z.ZodEnum<{
            "flex-start": "flex-start";
            center: "center";
            "flex-end": "flex-end";
        }>;
        vAlign: z.ZodEnum<{
            "flex-start": "flex-start";
            center: "center";
            "flex-end": "flex-end";
        }>;
        responsive: z.ZodOptional<z.ZodObject<{
            mobile: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                layout: z.ZodOptional<z.ZodObject<{
                    row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                }, z.core.$strip>>;
                hAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
                vAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
            }, z.core.$strip>>>;
            tablet: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                layout: z.ZodOptional<z.ZodObject<{
                    row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                }, z.core.$strip>>;
                hAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
                vAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
            }, z.core.$strip>>>;
            desktop: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                layout: z.ZodOptional<z.ZodObject<{
                    row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                }, z.core.$strip>>;
                hAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
                vAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
            }, z.core.$strip>>>;
        }, z.core.$strip>>;
        type: z.ZodLiteral<"background">;
        src: z.ZodOptional<z.ZodString>;
        color: z.ZodOptional<z.ZodString>;
        mediaHandle: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        bgStyle: z.ZodDefault<z.ZodEnum<{
            stretch: "stretch";
            tile: "tile";
        }>>;
    }, z.core.$strip>], "type">>;
    publishedAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    meta: z.ZodOptional<z.ZodCatch<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
}, z.core.$strip>;
export type PageContentResponse = z.infer<typeof PageContentResponseSchema>;
export declare const PageWithMetaSchema: z.ZodObject<{
    id: z.ZodString;
    slug: z.ZodString;
    title: z.ZodString;
    status: z.ZodEnum<{
        draft: "draft";
        published: "published";
    }>;
    updatedAt: z.ZodString;
    blocks: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
        id: z.ZodString;
        layout: z.ZodObject<{
            row: z.ZodCoercedNumber<unknown>;
            colStart: z.ZodCoercedNumber<unknown>;
            colSpan: z.ZodCoercedNumber<unknown>;
            rowSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
        }, z.core.$strip>;
        fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
        hAlign: z.ZodEnum<{
            "flex-start": "flex-start";
            center: "center";
            "flex-end": "flex-end";
        }>;
        vAlign: z.ZodEnum<{
            "flex-start": "flex-start";
            center: "center";
            "flex-end": "flex-end";
        }>;
        responsive: z.ZodOptional<z.ZodObject<{
            mobile: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                layout: z.ZodOptional<z.ZodObject<{
                    row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                }, z.core.$strip>>;
                hAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
                vAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
            }, z.core.$strip>>>;
            tablet: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                layout: z.ZodOptional<z.ZodObject<{
                    row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                }, z.core.$strip>>;
                hAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
                vAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
            }, z.core.$strip>>>;
            desktop: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                layout: z.ZodOptional<z.ZodObject<{
                    row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                }, z.core.$strip>>;
                hAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
                vAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
            }, z.core.$strip>>>;
        }, z.core.$strip>>;
        type: z.ZodLiteral<"title">;
        text: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        id: z.ZodString;
        layout: z.ZodObject<{
            row: z.ZodCoercedNumber<unknown>;
            colStart: z.ZodCoercedNumber<unknown>;
            colSpan: z.ZodCoercedNumber<unknown>;
            rowSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
        }, z.core.$strip>;
        fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
        hAlign: z.ZodEnum<{
            "flex-start": "flex-start";
            center: "center";
            "flex-end": "flex-end";
        }>;
        vAlign: z.ZodEnum<{
            "flex-start": "flex-start";
            center: "center";
            "flex-end": "flex-end";
        }>;
        responsive: z.ZodOptional<z.ZodObject<{
            mobile: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                layout: z.ZodOptional<z.ZodObject<{
                    row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                }, z.core.$strip>>;
                hAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
                vAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
            }, z.core.$strip>>>;
            tablet: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                layout: z.ZodOptional<z.ZodObject<{
                    row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                }, z.core.$strip>>;
                hAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
                vAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
            }, z.core.$strip>>>;
            desktop: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                layout: z.ZodOptional<z.ZodObject<{
                    row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                }, z.core.$strip>>;
                hAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
                vAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
            }, z.core.$strip>>>;
        }, z.core.$strip>>;
        type: z.ZodLiteral<"byline">;
        author: z.ZodString;
        publishedAt: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>, z.ZodObject<{
        id: z.ZodString;
        layout: z.ZodObject<{
            row: z.ZodCoercedNumber<unknown>;
            colStart: z.ZodCoercedNumber<unknown>;
            colSpan: z.ZodCoercedNumber<unknown>;
            rowSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
        }, z.core.$strip>;
        fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
        hAlign: z.ZodEnum<{
            "flex-start": "flex-start";
            center: "center";
            "flex-end": "flex-end";
        }>;
        vAlign: z.ZodEnum<{
            "flex-start": "flex-start";
            center: "center";
            "flex-end": "flex-end";
        }>;
        responsive: z.ZodOptional<z.ZodObject<{
            mobile: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                layout: z.ZodOptional<z.ZodObject<{
                    row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                }, z.core.$strip>>;
                hAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
                vAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
            }, z.core.$strip>>>;
            tablet: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                layout: z.ZodOptional<z.ZodObject<{
                    row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                }, z.core.$strip>>;
                hAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
                vAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
            }, z.core.$strip>>>;
            desktop: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                layout: z.ZodOptional<z.ZodObject<{
                    row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                }, z.core.$strip>>;
                hAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
                vAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
            }, z.core.$strip>>>;
        }, z.core.$strip>>;
        type: z.ZodLiteral<"text">;
        text: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        id: z.ZodString;
        layout: z.ZodObject<{
            row: z.ZodCoercedNumber<unknown>;
            colStart: z.ZodCoercedNumber<unknown>;
            colSpan: z.ZodCoercedNumber<unknown>;
            rowSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
        }, z.core.$strip>;
        fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
        hAlign: z.ZodEnum<{
            "flex-start": "flex-start";
            center: "center";
            "flex-end": "flex-end";
        }>;
        vAlign: z.ZodEnum<{
            "flex-start": "flex-start";
            center: "center";
            "flex-end": "flex-end";
        }>;
        responsive: z.ZodOptional<z.ZodObject<{
            mobile: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                layout: z.ZodOptional<z.ZodObject<{
                    row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                }, z.core.$strip>>;
                hAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
                vAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
            }, z.core.$strip>>>;
            tablet: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                layout: z.ZodOptional<z.ZodObject<{
                    row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                }, z.core.$strip>>;
                hAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
                vAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
            }, z.core.$strip>>>;
            desktop: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                layout: z.ZodOptional<z.ZodObject<{
                    row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                }, z.core.$strip>>;
                hAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
                vAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
            }, z.core.$strip>>>;
        }, z.core.$strip>>;
        type: z.ZodLiteral<"image">;
        src: z.ZodString;
        alt: z.ZodOptional<z.ZodString>;
        mediaHandle: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        imageStyle: z.ZodOptional<z.ZodObject<{
            columns: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
        }, z.core.$strict>>;
    }, z.core.$strip>, z.ZodObject<{
        id: z.ZodString;
        layout: z.ZodObject<{
            row: z.ZodCoercedNumber<unknown>;
            colStart: z.ZodCoercedNumber<unknown>;
            colSpan: z.ZodCoercedNumber<unknown>;
            rowSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
        }, z.core.$strip>;
        fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
        hAlign: z.ZodEnum<{
            "flex-start": "flex-start";
            center: "center";
            "flex-end": "flex-end";
        }>;
        vAlign: z.ZodEnum<{
            "flex-start": "flex-start";
            center: "center";
            "flex-end": "flex-end";
        }>;
        responsive: z.ZodOptional<z.ZodObject<{
            mobile: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                layout: z.ZodOptional<z.ZodObject<{
                    row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                }, z.core.$strip>>;
                hAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
                vAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
            }, z.core.$strip>>>;
            tablet: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                layout: z.ZodOptional<z.ZodObject<{
                    row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                }, z.core.$strip>>;
                hAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
                vAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
            }, z.core.$strip>>>;
            desktop: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
                layout: z.ZodOptional<z.ZodObject<{
                    row: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colStart: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    colSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
                    rowSpan: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
                }, z.core.$strip>>;
                hAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
                vAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
            }, z.core.$strip>>>;
        }, z.core.$strip>>;
        type: z.ZodLiteral<"background">;
        src: z.ZodOptional<z.ZodString>;
        color: z.ZodOptional<z.ZodString>;
        mediaHandle: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        bgStyle: z.ZodDefault<z.ZodEnum<{
            stretch: "stretch";
            tile: "tile";
        }>>;
    }, z.core.$strip>], "type">>;
    publishedAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    meta: z.ZodOptional<z.ZodCatch<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
}, z.core.$strip>;
export type PageWithMeta = z.infer<typeof PageWithMetaSchema>;
//# sourceMappingURL=content-block.model.d.ts.map