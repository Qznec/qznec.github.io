gaf.ReadSingleTag = function (stream) {
    var tagId = stream.Ushort();
    var tag = gaf.Tags[tagId];
    var result = {};
    if (typeof tag === "undefined") {
        console.log("GAF. Non implemented tag detected.");
        gaf.Tags.Default.parse(stream, tagId);
    }
    else {
        console.log("tag " + tag.tagName);
        result = tag.parse(stream, tagId);
    }
    return result;
};

gaf.ReadTags = function (stream) {
    var tags = [];
    try {
        do {
            var tag = gaf.ReadSingleTag(stream);
            tags.push(tag);
        } while (tag.tagId != 0);
    }
    catch (e) {
        if (e instanceof Error && e.message == "GAF format error") {
            console.log("GAF format error:\n" + e.stack);
            // Tag will be closed and parser will continue from where it should.
        }
        else {
            console.log(e.stack);
            throw e;
        }
    }
    return tags;
};


gaf.Tag = function () {
    this.Default = Object.create(gaf.Tag.base);
    this["0"] = Object.create(gaf.Tag.End);
    this["1"] = Object.create(gaf.Tag.DefineAtlas);
    this["2"] = Object.create(gaf.Tag.DefineAnimationMasks);
    this["3"] = Object.create(gaf.Tag.DefineAnimationObjects);
    this["4"] = Object.create(gaf.Tag.DefineAnimationFrames);
    this["5"] = Object.create(gaf.Tag.DefineNamedParts);
    this["6"] = Object.create(gaf.Tag.DefineSequences);
    this["7"] = Object.create(gaf.Tag.DefineTextFields);
    this["8"] = Object.create(gaf.Tag.DefineAtlas2);
    this["9"] = Object.create(gaf.Tag.DefineStage);
    this["10"] = Object.create(gaf.Tag.DefineAnimationObjects2);
    this["11"] = Object.create(gaf.Tag.DefineAnimationMasks2);
    this["12"] = Object.create(gaf.Tag.DefineAnimationFrames2);
    this["13"] = Object.create(gaf.Tag.DefineTimeline);
    this["14"] = Object.create(gaf.Tag.DefineSounds);
    this["15"] = Object.create(gaf.Tag.DefineAtlas3);
    this["16"] = Object.create(gaf.Tag.DefineAtlas4);
    this["17"] = Object.create(gaf.Tag.DefineTimeline2);
    this["18"] = Object.create(gaf.Tag.DefineExternalObjects);
    this["19"] = Object.create(gaf.Tag.DefineAnimationFrames3);
    this["20"] = Object.create(gaf.Tag.DefineTimeline3);
    this["21"] = Object.create(gaf.Tag.DefineExternalObjects2);
	this["22"] = Object.create(gaf.Tag.DefineStencil);
};

gaf.Tag.base = function () {
};
gaf.Tag.base.parse = function (stream, tagId) {
    var size = stream.Uint();

    stream.startNestedBuffer(size);
    var result = this.doParse(stream);
    stream.endNestedBuffer();

    result.tagName = this.tagName;
    result.tagId = tagId;
    return result;
};
gaf.Tag.base.doParse = function (stream) {
    return {};
};

gaf.Tag.End = Object.create(gaf.Tag.base);
gaf.Tag.End.tagName = "TagEnd";

gaf.Tag.DefineAtlas = Object.create(gaf.Tag.base);
gaf.Tag.DefineAtlas.tagName = "TagDefineAtlas";
gaf.Tag.DefineAtlas.doParse = function (s) {
    var exec = s.fields(
        'scale', 'Float',
        'atlases', s.array('Ubyte', s.fields(
            'id', 'Uint',
            'sources', s.array('Ubyte', s.fields(
                'source', 'String',
                'csf', 'Float'
            ))
        )),
        'elements', s.array('Uint', s.fields(
            'pivot', 'Point',
            'origin', 'Point',
            'scale', 'Float',
            'size', 'Point',
            'atlasId', 'Uint',
            'elementAtlasId', 'Uint'
        ))
    );
    return {'content': exec()};
};

gaf.Tag.DefineAnimationMasks = Object.create(gaf.Tag.base);
gaf.Tag.DefineAnimationMasks.tagName = "TagDefineAnimationMasks";
gaf.Tag.DefineAnimationMasks.doParse = function (s) {
    var exec = s.array('Uint', s.fields(
        'objectId', 'Uint',
        'elementAtlasIdRef', 'Uint'
    ));
    var result = {'content': exec()};
    debugger;
    return result;
};

gaf.Tag.DefineAnimationObjects = Object.create(gaf.Tag.base);
gaf.Tag.DefineAnimationObjects.tagName = "TagDefineAnimationObjects";
gaf.Tag.DefineAnimationObjects.doParse = function (s) {
    var exec = s.array('Uint', s.fields(
        'objectId', 'Uint',
        'elementAtlasIdRef', 'Uint'
    ));
    return {'content': exec()};
};

gaf.Tag.DefineAnimationFrames = Object.create(gaf.Tag.base);
gaf.Tag.DefineAnimationFrames.tagName = "TagDefineAnimationFrames";
gaf.Tag.DefineAnimationFrames.doParse = function (s) {
    var exec = s.array('Uint', s.fields(
        'frame', 'Uint',
        'state', s.array('Uint', s.fields(
            'hasColorTransform', 'Ubyte',
            'hasMask', 'Ubyte',
            'hasEffect', 'Ubyte',
            'objectIdRef', 'Uint',
            'depth', 'Int',
            'alpha', 'Float',
            'matrix', 'Matrix',
            'colorTransform', s.condition('hasColorTransform', 1, s.fields(
                'alphaOffset', 'Float',
                'redMultiplier', 'Float',
                'redOffset', 'Float',
                'greenMultiplier', 'Float',
                'greenOffset', 'Float',
                'blueMultiplier', 'Float',
                'blueOffset', 'Float'
            )),
            'effect', s.condition('hasEffect', 1, s.array('Ubyte', gaf.Tag._readFilter(s))),
            'maskObjectIdRef', s.condition('hasMask', 1, s.fields(
                'maskObjectIdRef', 'Uint'
            ))
        ))
    ));
    return {'content': exec()};
};

gaf.Tag.DefineNamedParts = Object.create(gaf.Tag.base);
gaf.Tag.DefineNamedParts.tagName = "TagDefineNamedParts";
gaf.Tag.DefineNamedParts.doParse = function (s) {
    var exec = s.array('Uint', s.fields(
        'objectId', 'Uint',
        'name', 'String'
    ));
    return {'content': exec()};
};

gaf.Tag.DefineSequences = Object.create(gaf.Tag.base);
gaf.Tag.DefineSequences.tagName = "TagDefineSequences";
gaf.Tag.DefineSequences.doParse = function (s) {
    var exec = s.array('Uint', s.fields(
        'id', 'String',
        'start', 'Ushort',
        'end', 'Ushort'
    ));
    return {'content': exec()};
};

gaf.Tag.DefineSounds = Object.create(gaf.Tag.base);
gaf.Tag.DefineSounds.tagName = "TagDefineSounds";
gaf.Tag.DefineSounds.doParse = function (s) {
    var exec = s.array('Ushort', s.fields(
        'id', 'Ushort',
        'linkage', 'String',
        'source', 'String',
        'format', 'Ubyte',
        'rate', 'Ubyte',
        'sampleSize', 'Ubyte',
        'stereo', 'Boolean',
        'sampleCount', 'Uint'
    ));
    return {'content': exec()};
};

gaf.Tag.DefineTextFields = Object.create(gaf.Tag.base);
gaf.Tag.DefineTextFields.tagName = "TagDefineTextFields";
gaf.Tag.DefineTextFields.doParse = function (s) {
    var exec = s.array('Uint', s.fields(
        'id', 'Uint',
        'pivot', 'Point',
        'width', 'Float',
        'height', 'Float',
        'text', 'String',
        'embedFonts', 'Boolean',
        'multiline', 'Boolean',
        'wordWrap', 'Boolean',
        'hasRestrict', 'Boolean',
        'restrict', s.condition('hasRestrict', 1, function () {
            return s['String'];
        }),
        'editable', 'Boolean',
        'selectable', 'Boolean',
        'displayAsPassword', 'Boolean',
        'maxChars', 'Uint',
        'align', 'Uint',
        'blockIndent', 'Uint',
        'bold', 'Boolean',
        'bullet', 'Boolean',
        'color', 'color',
        'font', 'String',
        'indent', 'Uint',
        'italic', 'Boolean',
        'kerning', 'Boolean',
        'leading', 'Uint',
        'leftMargin', 'Uint',
        'letterSpacing', 'Float',
        'rightMargin', 'Uint',
        'size', 'Uint',
        'tabStops', s.array('Uint', s.fields(
            'value', 'Uint'
        )),
        'target', 'String',
        'underline', 'Boolean',
        'url', 'String'
    ));
    return {'content': exec()};
};

gaf.Tag.DefineAtlas2 = Object.create(gaf.Tag.base);
gaf.Tag.DefineAtlas2.tagName = "TagDefineAtlas2";
gaf.Tag.DefineAtlas2.doParse = function (s) {
    var exec = s.fields(
        'scale', 'Float',
        'atlases', s.array('Ubyte', s.fields(
            'id', 'Uint',
            'sources', s.array('Ubyte', s.fields(
                'source', 'String',
                'csf', 'Float'
            ))
        )),
        'elements', s.array('Uint', s.fields(
            'pivot', 'Point',
            'origin', 'Point',
            'scale', 'Float',
            'size', 'Point',
            'atlasId', 'Uint',
            'elementAtlasId', 'Uint',
            'hasScale9Grid', 'Boolean',
            'scale9GridRect', s.condition('hasScale9Grid', 1, function () {
                return s.Rect();
            })
        ))
    );
    return {'content': exec()};
};

gaf.Tag.DefineAtlas3 = Object.create(gaf.Tag.base);
gaf.Tag.DefineAtlas3.tagName = "TagDefineAtlas3";
gaf.Tag.DefineAtlas3.doParse = function (s) {
    var exec = s.fields(
        'scale', 'Float',
        'atlases', s.array('Ubyte', s.fields(
            'id', 'Uint',
            'sources', s.array('Ubyte', s.fields(
                'source', 'String',
                'csf', 'Float'
            ))
        )),
        'elements', s.array('Uint', s.fields(
            'pivot', 'Point',
            'origin', 'Point',
            'width', 'Float',
            'height', 'Float',
            'atlasId', 'Uint',
            'elementAtlasId', 'Uint',
            'hasScale9Grid', 'Boolean',
            'scale9GridRect', s.condition('hasScale9Grid', 1, function () {
                return s.Rect();
            }),
            'scale', 'Point',
            'rotation', 'Boolean',
            'linkageName', 'String'
        ))
    );
    return {'content': exec()};
};


gaf.Tag.DefineAtlas4 = Object.create(gaf.Tag.base);
gaf.Tag.DefineAtlas4.tagName = "TagDefineAtlas4";
gaf.Tag.DefineAtlas4.doParse = function (s) {
    var exec = s.fields(
        'scale', 'Float',
        'atlases', s.array('Ubyte', s.fields(
            'id', 'Uint',
            'sources', s.array('Ubyte', s.fields(
                'source', 'String',
                'csf', 'Float'
            ))
        )),
        'elements', s.array('Uint', s.fields(
            'pivot', 'Point',
            'origin', 'Point',
            'width', 'Float',
            'height', 'Float',
            'atlasId', 'Uint',
            'elementAtlasId', 'Uint',
            'hasScale9Grid', 'Boolean',
            'scale9GridRect', s.condition('hasScale9Grid', 1, function () {
                return s.Rect();
            }),
            'scale', 'Point',
            'rotation', 'Boolean',
            'linkageName', 'String',
            'baseClass', 'String'
        ))
    );
    return {'content': exec()};
};


gaf.Tag.DefineStage = Object.create(gaf.Tag.base);
gaf.Tag.DefineStage.tagName = "TagDefineStage";
gaf.Tag.DefineStage.doParse = function (s) {
    var exec = s.fields(
        'fps', 'Ubyte',
        'color', 'color',
        'width', 'Ushort',
        'height', 'Ushort'
    );
    return {'content': exec()};
};

gaf.Tag.DefineAnimationObjects2 = Object.create(gaf.Tag.base);
gaf.Tag.DefineAnimationObjects2.tagName = "TagDefineAnimationObjects2";
gaf.Tag.DefineAnimationObjects2.doParse = function (s) {
    var exec = s.array('Uint', s.fields(
        'objectId', 'Uint',
        'elementAtlasIdRef', 'Uint',
        'type', 'Ushort'
    ));
    return {'content': exec()};
};

gaf.Tag.DefineAnimationMasks2 = Object.create(gaf.Tag.base);
gaf.Tag.DefineAnimationMasks2.tagName = "TagDefineAnimationMasks2";
gaf.Tag.DefineAnimationMasks2.doParse = function (s) {
    var exec = s.array('Uint', s.fields(
        'objectId', 'Uint',
        'elementAtlasIdRef', 'Uint',
        'type', 'Ushort'
    ));
    return {'content': exec()};
};

gaf.Tag.DefineAnimationFrames2 = Object.create(gaf.Tag.base);
gaf.Tag.DefineAnimationFrames2.tagName = "TagDefineAnimationFrames2";
gaf.Tag.DefineAnimationFrames2.doParse = function (s) {
    var exec = s.array('Uint', s.fields(
        'frame', 'Uint',
        'hasChangesInDisplayList', 'Boolean',
        'hasActions', 'Boolean',
        'state', s.condition('hasChangesInDisplayList', 1, s.array('Uint', s.fields(
            'hasColorTransform', 'Boolean',
            'hasMask', 'Boolean',
            'hasEffect', 'Boolean',
            'objectIdRef', 'Uint',
            'depth', 'Int',
            'alpha', 'Float',
            'matrix', 'Matrix',
            'colorTransform', s.condition('hasColorTransform', 1, s.fields(
                'alphaOffset', 'Float',
                'redMultiplier', 'Float',
                'redOffset', 'Float',
                'greenMultiplier', 'Float',
                'greenOffset', 'Float',
                'blueMultiplier', 'Float',
                'blueOffset', 'Float'
            )),
            'effect', s.condition('hasEffect', 1, s.array('Ubyte', gaf.Tag._readFilter(s))),
            'maskObjectIdRef', s.condition('hasMask', 1, function () {
                return s.Uint()
            })
        ))),
        'actions', s.condition('hasActions', 1, s.array('Uint', s.fields(
            'type', 'Uint',
            'scope', 'String',
            'params', gaf.Tag._readActionArguments(s)
        )))
    ));
    return {'content': exec()};
};

gaf.Tag.DefineAnimationFrames3 = Object.create(gaf.Tag.base);
gaf.Tag.DefineAnimationFrames3.tagName = "TagDefineAnimationFrames3";
gaf.Tag.DefineAnimationFrames3.doParse = function (s) {
    var exec = s.array('Uint', s.fields(
        'frame', 'Uint',
        'hasChangesInDisplayList', 'Boolean',
        'hasActions', 'Boolean',
        'state', s.condition('hasChangesInDisplayList', 1, s.array('Uint', s.fields(
            'hasColorTransform', 'Boolean',
            'hasMask', 'Boolean',
            'hasEffect', 'Boolean',
            'objectIdRef', 'Uint',
            'depth', 'Int',
            'alpha', 'Float',
            'matrix', 'Matrix',
            'colorTransform', s.condition('hasColorTransform', 1, s.fields(
                'alphaOffset', 'Float',
                'redMultiplier', 'Float',
                'redOffset', 'Float',
                'greenMultiplier', 'Float',
                'greenOffset', 'Float',
                'blueMultiplier', 'Float',
                'blueOffset', 'Float'
            )),
            'effect', s.condition('hasEffect', 1, s.array('Ubyte', gaf.Tag._readFilter(s))),
            'maskObjectIdRef', s.condition('hasMask', 1, function () {
                return s.Uint()
            }),
            'customProps', s.array('Ushort', s.fields(
                'valueIndex', 'Uint'
            ))
        ))),
        'actions', s.condition('hasActions', 1, s.array('Uint', s.fields(
            'type', 'Uint',
            'scope', 'String',
            'params', gaf.Tag._readActionArguments(s)
        )))
    ));
    return {'content': exec()};
};

gaf.Tag.DefineTimeline = Object.create(gaf.Tag.base);
gaf.Tag.DefineTimeline.tagName = "TagDefineTimeline";
gaf.Tag.DefineTimeline.doParse = function (s) {
    var exec = s.fields(
        'id', 'Uint',
        'animationFrameCount', 'Uint',
        'boundingBox', 'Rect',
        'pivotPoint', 'Point',
        'hasLinkage', 'Boolean',
        'linkageName', s.condition('hasLinkage', 1, function () {
            return s.String();
        })
    );
    var result = {'content': exec()};
    result.content.tags = gaf.ReadTags(s);
    return result;
};

gaf.Tag.DefineTimeline2 = Object.create(gaf.Tag.base);
gaf.Tag.DefineTimeline2.tagName = "TagDefineTimeline2";
gaf.Tag.DefineTimeline2.doParse = function (s) {
    var exec = s.fields(
        'id', 'Uint',
        'animationFrameCount', 'Uint',
        'boundingBox', 'Rect',
        'pivotPoint', 'Point',
        'linkageName', 'String',
        'baseClass', 'String'
    );
    var result = {'content': exec()};
    result.content.tags = gaf.ReadTags(s);
    return result;
};

gaf.Tag.DefineTimeline3 = Object.create(gaf.Tag.base);
gaf.Tag.DefineTimeline3.tagName = "TagDefineTimeline3";
gaf.Tag.DefineTimeline3.doParse = function (s) {
    var exec = s.fields(
        'id', 'Uint',
        'animationFrameCount', 'Uint',
        'boundingBox', 'Rect',
        'pivotPoint', 'Point',
        'linkageName', 'String',
        'baseClass', 'String',
        'customProperties', 'JSON'
    );
    var result = {'content': exec()};
    result.content.tags = gaf.ReadTags(s);
    return result;
};

gaf.Tag._readActionArguments = function (s) {
    return function () {
        var size = s.Uint();
        var ret = [];
        s.startNestedBuffer(size);
        while (s.maxOffset() < s.tell()) {
            ret.push(s.String());
        }
        s.endNestedBuffer();
        return ret;
    };
};

gaf.Tag._readFilter = function (s) {
    return s.fields(
        'type', 'Uint',
        'dropShadow', s.condition('type', gaf.EFFECT_DROP_SHADOW, s.fields( // DropShadow
            'color', 'color',
            'blurX', 'Float',
            'blurY', 'Float',
            'angle', 'Float',
            'distance', 'Float',
            'strength', 'Float',
            'inner', 'Boolean',
            'knockout', 'Boolean'
        )),
        'blur', s.condition('type', gaf.EFFECT_BLUR, s.fields( // Blur
            'blurX', 'Float',
            'blurY', 'Float'
        )),
        'glow', s.condition('type', gaf.EFFECT_GLOW, s.fields( // Glow
            'color', 'color',
            'blurX', 'Float',
            'blurY', 'Float',
            'strength', 'Float',
            'inner', 'Boolean',
            'knockout', 'Boolean'
        )),
        'colorMatrix', s.condition('type', gaf.EFFECT_COLOR_MATRIX, s.fields( // ColorMatrix
            'rr', 'Float', 'gr', 'Float', 'br', 'Float', 'ar', 'Float', 'r', 'Float',
            'rg', 'Float', 'gg', 'Float', 'bg', 'Float', 'ag', 'Float', 'g', 'Float',
            'rb', 'Float', 'gb', 'Float', 'bb', 'Float', 'ab', 'Float', 'b', 'Float',
            'ra', 'Float', 'ga', 'Float', 'ba', 'Float', 'aa', 'Float', 'a', 'Float'
        ))
    )
};


gaf.Tag.DefineExternalObjects = Object.create(gaf.Tag.base);
gaf.Tag.DefineExternalObjects.tagName = "TagDefineExternalObjects";
gaf.Tag.DefineExternalObjects.doParse = function (s) {
    var exec = s.array('Uint', s.fields(
        'objectId', 'Uint',
        'linkageName', 'String'
    ));
    return {'content': exec()};
};

gaf.Tag.DefineExternalObjects2 = Object.create(gaf.Tag.base);
gaf.Tag.DefineExternalObjects2.tagName = "TagDefineExternalObjects2";
gaf.Tag.DefineExternalObjects2.doParse = function (s) {
    var exec = s.array('Uint', s.fields(
        'objectId', 'Uint',
        'linkageName', 'String',
        'customProperties', 'JSON'
    ));
    return {'content': exec()};
};

gaf.Tag.DefineStencil = Object.create(gaf.Tag.base);
gaf.Tag.DefineStencil.tagName = "TagDefineStencil";
gaf.Tag.DefineStencil.doParse = function (s) {
	var exec = gaf.Tag._readStencil(s);
	return {'content': exec()};
};

gaf.Tag._readStencil = function(s) {
    return function () {
        var scale = s.Float();
        var width = s.Uint();
        var height = s.Uint();
		
        var ret = {};
		ret['scale'] = scale;
		ret['width'] = width;
		ret['height'] = height;
		
		var size = Math.ceil(width * height / 8);
		var bitsetStr = "";
        s.startNestedBuffer(size);
        for (var i = 0; i < size; ++i) {
			var byteStr = s.Ubyte().toString(2);
			byteStr = ('00000000' + byteStr).substring(byteStr.length);
            bitsetStr += byteStr;
        }
        s.endNestedBuffer();
		
		var bitset = [];
		for (var i = 0; i < height; ++i) {
			var fromIdx = i * width;
			var toIdx = fromIdx + width;
			var rowStr = bitsetStr.substring(fromIdx, toIdx);
			bitset.push(rowStr);
        }
		ret['bitset'] = bitset;
		
        return ret;
    };
};

gaf.Tags = new gaf.Tag();
