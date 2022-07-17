load(":prerender_component.bzl", "prerender_component")

def prerender_link_component(
    name,
    package,
    component_name,
    testonly = None,
    visibility = None,
):
    prerender_component(
        name = name,
        package = package,
        # scripts = [],
        # styles = [],
        # resources = None,
        testonly = testonly,
        visibility = visibility,
    )
